from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin, require_volunteer
from app.models.volunteer import Volunteer
from app.schemas.volunteer import VolunteerOut, VolunteerRejectIn
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
    if volunteer.status != "Pending Approval":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot approve a volunteer that is currently '{volunteer.status}'",
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
    if volunteer.status != "Pending Approval":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot reject a volunteer that is currently '{volunteer.status}'",
        )
    volunteer.status = "Rejected"
    record_event(db, "volunteer_rejected", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{volunteer.name} ({volunteer.email}): {payload.reason}")
    db.commit()
    db.refresh(volunteer)
    return volunteer
