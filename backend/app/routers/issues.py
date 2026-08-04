from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin, require_volunteer
from app.models.volunteer import Volunteer
from app.models.volunteer_issue_report import VolunteerIssueReport
from app.schemas.volunteer_issue_report import (
    VolunteerIssueReportOut,
    VolunteerIssueReportResolveIn,
    VolunteerIssueReportSubmitIn,
)
from app.services.audit import record_event

router = APIRouter(prefix="/volunteer-issues", tags=["volunteer-issues"])


@router.get("/mine", response_model=list[VolunteerIssueReportOut])
@limiter.limit("60/minute")
def list_my_issues(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    return (
        db.query(VolunteerIssueReport)
        .filter(VolunteerIssueReport.volunteer_id == UUID(claims["sub"]))
        .order_by(VolunteerIssueReport.created_at.desc())
        .all()
    )


@router.post("/mine", response_model=VolunteerIssueReportOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def submit_my_issue(
    request: Request,
    payload: VolunteerIssueReportSubmitIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_volunteer)],
):
    volunteer = db.query(Volunteer).filter(Volunteer.id == UUID(claims["sub"])).first()
    if volunteer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volunteer not found")
    issue = VolunteerIssueReport(
        volunteer_id=volunteer.id,
        volunteer_name=volunteer.name,
        category=payload.category,
        description=payload.description,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@router.get("", response_model=list[VolunteerIssueReportOut])
@limiter.limit("60/minute")
def list_issues(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(VolunteerIssueReport)
        .order_by(VolunteerIssueReport.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("/{issue_id}/resolve", response_model=VolunteerIssueReportOut)
@limiter.limit("30/minute")
def resolve_issue(
    request: Request,
    issue_id: UUID,
    payload: VolunteerIssueReportResolveIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    issue = db.query(VolunteerIssueReport).filter(VolunteerIssueReport.id == issue_id).first()
    if issue is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Issue report not found")
    if issue.status == "Resolved":
        raise HTTPException(status.HTTP_409_CONFLICT, "Issue is already resolved")
    issue.status = "Resolved"
    if payload.resolution_notes:
        issue.resolution_notes = payload.resolution_notes
    record_event(db, "volunteer_issue_resolved", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{issue.volunteer_name}: {issue.category}")
    db.commit()
    db.refresh(issue)
    return issue
