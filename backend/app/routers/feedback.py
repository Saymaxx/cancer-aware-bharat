from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin
from app.models.volunteer_feedback import VolunteerFeedback
from app.schemas.volunteer_feedback import VolunteerFeedbackIn, VolunteerFeedbackOut, VolunteerFeedbackRespondIn

router = APIRouter(prefix="/volunteer-feedback", tags=["volunteer-feedback"])


@router.get("", response_model=list[VolunteerFeedbackOut])
@limiter.limit("60/minute")
def list_volunteer_feedback(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(VolunteerFeedback)
        .order_by(VolunteerFeedback.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=VolunteerFeedbackOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_volunteer_feedback(
    request: Request,
    payload: VolunteerFeedbackIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    # Admin/superadmin-only for now -- no volunteer-facing submission UI
    # exists yet (see VolunteerFeedback model docstring).
    feedback = VolunteerFeedback(**payload.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.post("/{feedback_id}/respond", response_model=VolunteerFeedbackOut)
@limiter.limit("30/minute")
def respond_to_feedback(
    request: Request,
    feedback_id: UUID,
    payload: VolunteerFeedbackRespondIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    feedback = db.query(VolunteerFeedback).filter(VolunteerFeedback.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Feedback not found")
    if feedback.status == "Responded":
        raise HTTPException(status.HTTP_409_CONFLICT, "Feedback already has a response")
    feedback.response = payload.response
    feedback.status = "Responded"
    db.commit()
    db.refresh(feedback)
    return feedback
