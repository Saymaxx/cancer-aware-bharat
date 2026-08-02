from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin, require_volunteer
from app.models.volunteer import Volunteer
from app.models.volunteer_feedback import VolunteerFeedback
from app.schemas.volunteer_feedback import (
    VolunteerFeedbackIn,
    VolunteerFeedbackOut,
    VolunteerFeedbackRespondIn,
    VolunteerFeedbackSubmitIn,
)

router = APIRouter(prefix="/volunteer-feedback", tags=["volunteer-feedback"])


@router.get("/mine", response_model=list[VolunteerFeedbackOut])
@limiter.limit("60/minute")
def list_my_feedback(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_volunteer)],
):
    return (
        db.query(VolunteerFeedback)
        .filter(VolunteerFeedback.volunteer_id == UUID(claims["sub"]))
        .order_by(VolunteerFeedback.created_at.desc())
        .all()
    )


@router.post("/mine", response_model=VolunteerFeedbackOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def submit_my_feedback(
    request: Request,
    payload: VolunteerFeedbackSubmitIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_volunteer)],
):
    volunteer = db.query(Volunteer).filter(Volunteer.id == UUID(claims["sub"])).first()
    if volunteer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volunteer not found")
    feedback = VolunteerFeedback(
        volunteer_id=volunteer.id,
        volunteer_name=volunteer.name,
        campaign_name=payload.campaign_name,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


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
    # Lets staff log feedback on a volunteer's behalf (e.g. from a phone
    # call); volunteers submitting their own use POST /volunteer-feedback/mine.
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
