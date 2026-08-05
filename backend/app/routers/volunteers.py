from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin, require_volunteer
from app.models.volunteer import Volunteer
from app.models.volunteer_campaign_enrollment import VolunteerCampaignEnrollment
from app.models.volunteer_hours_log import VolunteerHoursLog
from app.models.volunteer_training_progress import VolunteerTrainingProgress
from app.schemas.volunteer import VolunteerOut, VolunteerRejectIn
from app.schemas.volunteer_campaign_enrollment import (
    VolunteerCampaignEnrollmentAdminOut,
    VolunteerCampaignEnrollmentOut,
    VolunteerCampaignEnrollmentRejectIn,
)
from app.schemas.volunteer_hours import VolunteerHoursLogIn, VolunteerHoursLogOut
from app.schemas.volunteer_training_progress import VolunteerTrainingProgressIn, VolunteerTrainingProgressOut
from app.services.audit import record_event

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.get("/me", response_model=VolunteerOut)
@limiter.limit("60/minute")
def get_my_profile(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    volunteer = db.query(Volunteer).filter(Volunteer.id == UUID(claims["sub"])).first()
    if volunteer is None:
        # A still-valid token whose volunteer row was since deleted --
        # without this, returning None through response_model=VolunteerOut
        # fails FastAPI's response validation and surfaces as an unlogged 500.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volunteer not found")
    return volunteer


@router.get("", response_model=list[VolunteerOut])
@limiter.limit("60/minute")
def list_volunteers(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(Volunteer)
        .order_by(Volunteer.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/me/hours", response_model=list[VolunteerHoursLogOut])
@limiter.limit("60/minute")
def list_my_hours(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    return (
        db.query(VolunteerHoursLog)
        .filter(VolunteerHoursLog.volunteer_id == UUID(claims["sub"]))
        .order_by(VolunteerHoursLog.log_date.desc())
        .all()
    )


@router.post("/me/hours", response_model=VolunteerHoursLogOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def log_my_hours(
    request: Request,
    payload: VolunteerHoursLogIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_volunteer)],
):
    log = VolunteerHoursLog(volunteer_id=UUID(claims["sub"]), **payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/me/campaigns", response_model=list[VolunteerCampaignEnrollmentOut])
@limiter.limit("60/minute")
def list_my_campaigns(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    return (
        db.query(VolunteerCampaignEnrollment)
        .filter(VolunteerCampaignEnrollment.volunteer_id == UUID(claims["sub"]))
        .order_by(VolunteerCampaignEnrollment.enrolled_at.desc())
        .all()
    )


@router.post("/me/campaigns/{event_id}/check-in", response_model=VolunteerCampaignEnrollmentOut)
@limiter.limit("30/minute")
def check_in_to_campaign(
    request: Request,
    event_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_volunteer)],
):
    enrollment = db.query(VolunteerCampaignEnrollment).filter(
        VolunteerCampaignEnrollment.volunteer_id == UUID(claims["sub"]),
        VolunteerCampaignEnrollment.event_id == event_id,
    ).first()
    if enrollment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not enrolled in this campaign")
    if enrollment.status != "Approved":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot check in -- this enrollment is currently '{enrollment.status}'",
        )
    if enrollment.checked_in_at is None:
        enrollment.checked_in_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(enrollment)
    return enrollment


def _get_enrollment_or_404(db: Session, enrollment_id: UUID) -> VolunteerCampaignEnrollment:
    enrollment = db.query(VolunteerCampaignEnrollment).filter(VolunteerCampaignEnrollment.id == enrollment_id).first()
    if enrollment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment request not found")
    return enrollment


@router.get("/campaign-enrollments/pending", response_model=list[VolunteerCampaignEnrollmentAdminOut])
@limiter.limit("60/minute")
def list_pending_campaign_enrollments(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    """Volunteer requests to join a campaign, awaiting Admin/SuperAdmin
    approval before the volunteer is actually enrolled."""
    return (
        db.query(VolunteerCampaignEnrollment)
        .filter(VolunteerCampaignEnrollment.status == "Pending")
        .order_by(VolunteerCampaignEnrollment.enrolled_at.asc())
        .all()
    )


@router.post("/campaign-enrollments/{enrollment_id}/approve", response_model=VolunteerCampaignEnrollmentOut)
@limiter.limit("30/minute")
def approve_campaign_enrollment(
    request: Request,
    enrollment_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    enrollment = _get_enrollment_or_404(db, enrollment_id)
    if enrollment.status != "Pending":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot approve an enrollment that is currently '{enrollment.status}'",
        )
    enrollment.status = "Approved"
    record_event(db, "campaign_enrollment_approved", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{enrollment.volunteer.name} -> {enrollment.event.title}")
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.post("/campaign-enrollments/{enrollment_id}/reject", response_model=VolunteerCampaignEnrollmentOut)
@limiter.limit("30/minute")
def reject_campaign_enrollment(
    request: Request,
    enrollment_id: UUID,
    payload: VolunteerCampaignEnrollmentRejectIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    enrollment = _get_enrollment_or_404(db, enrollment_id)
    if enrollment.status != "Pending":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot reject an enrollment that is currently '{enrollment.status}'",
        )
    enrollment.status = "Rejected"
    enrollment.decision_notes = payload.reason
    record_event(db, "campaign_enrollment_rejected", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{enrollment.volunteer.name} -> {enrollment.event.title}: {payload.reason}")
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/me/training", response_model=list[VolunteerTrainingProgressOut])
@limiter.limit("60/minute")
def list_my_training(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    return (
        db.query(VolunteerTrainingProgress)
        .filter(VolunteerTrainingProgress.volunteer_id == UUID(claims["sub"]))
        .all()
    )


@router.patch("/me/training/{resource_id}", response_model=VolunteerTrainingProgressOut)
@limiter.limit("30/minute")
def update_my_training(
    request: Request,
    resource_id: str,
    payload: VolunteerTrainingProgressIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_volunteer)],
):
    volunteer_id = UUID(claims["sub"])
    row = db.query(VolunteerTrainingProgress).filter(
        VolunteerTrainingProgress.volunteer_id == volunteer_id,
        VolunteerTrainingProgress.resource_id == resource_id,
    ).first()
    if row is None:
        row = VolunteerTrainingProgress(volunteer_id=volunteer_id, resource_id=resource_id, progress=payload.progress)
        db.add(row)
    else:
        row.progress = payload.progress
    if payload.progress == 100 and row.completed_at is None:
        row.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return row


def _get_volunteer_or_404(db: Session, volunteer_id: UUID) -> Volunteer:
    volunteer = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if volunteer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volunteer not found")
    return volunteer


@router.post("/{volunteer_id}/approve", response_model=VolunteerOut)
@limiter.limit("30/minute")
def approve_volunteer(
    request: Request,
    volunteer_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    volunteer = _get_volunteer_or_404(db, volunteer_id)
    if volunteer.status == "Approved":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Volunteer is already approved",
        )
    volunteer.status = "Approved"
    record_event(db, "volunteer_approved", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{volunteer.name} ({volunteer.email})")
    db.commit()
    db.refresh(volunteer)
    return volunteer


@router.post("/{volunteer_id}/reject", response_model=VolunteerOut)
@limiter.limit("30/minute")
def reject_volunteer(
    request: Request,
    volunteer_id: UUID,
    payload: VolunteerRejectIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    volunteer = _get_volunteer_or_404(db, volunteer_id)
    if volunteer.status == "Rejected":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Volunteer is already rejected",
        )
    volunteer.status = "Rejected"
    record_event(db, "volunteer_rejected", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{volunteer.name} ({volunteer.email}): {payload.reason}")
    db.commit()
    db.refresh(volunteer)
    return volunteer
