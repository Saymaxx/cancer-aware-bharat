from datetime import date, datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin
from app.models.blog import BlogArticle
from app.models.survivor_story import SurvivorStorySubmission
from app.schemas.survivor_story import (
    SurvivorStoryOut,
    SurvivorStoryRejectIn,
    SurvivorStorySubmitIn,
)
from app.services.audit import record_event
from app.services.notifications import notify

router = APIRouter(prefix="/survivor-stories", tags=["survivor-stories"])


@router.post("", response_model=SurvivorStoryOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def submit_survivor_story(request: Request, payload: SurvivorStorySubmitIn, db: DbSession):
    """Public endpoint - anyone can submit a survivor story, no login required.
    Starts Pending; never auto-published (see admin approve/reject below)."""
    story = SurvivorStorySubmission(**payload.model_dump())
    db.add(story)
    db.flush()
    notify(db, "admin", "New Survivor Story Submission",
           f"{payload.name} submitted a survivor story: \"{payload.story_title}\".")
    db.commit()
    db.refresh(story)
    return story


@router.get("", response_model=list[SurvivorStoryOut])
@limiter.limit("60/minute")
def list_survivor_stories(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    story_status: str | None = Query(default=None, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    query = db.query(SurvivorStorySubmission)
    if story_status:
        query = query.filter(SurvivorStorySubmission.status == story_status)
    return query.order_by(SurvivorStorySubmission.created_at.desc()).offset(skip).limit(limit).all()


def _get_pending_story_or_404(db: Session, story_id: UUID) -> SurvivorStorySubmission:
    story = db.query(SurvivorStorySubmission).filter(SurvivorStorySubmission.id == story_id).first()
    if story is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Survivor story submission not found")
    if story.status != "Pending":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Story has already been {story.status.lower()}")
    return story


@router.post("/{story_id}/approve", response_model=SurvivorStoryOut)
@limiter.limit("30/minute")
def approve_survivor_story(
    request: Request,
    story_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    story = _get_pending_story_or_404(db, story_id)
    blog = BlogArticle(
        title=story.story_title,
        summary=story.content[:200] + ("..." if len(story.content) > 200 else ""),
        content=story.content,
        author=story.name,
        role="Cancer Survivor",
        date=date.today().strftime("%B %d, %Y"),
        read_time=f"{max(1, len(story.content.split()) // 200)} min read",
        category="Survivors",
        tags=[story.cancer_type],
    )
    db.add(blog)
    db.flush()
    story.status = "Approved"
    story.blog_article_id = blog.id
    story.reviewed_at = datetime.now(timezone.utc)
    record_event(db, "survivor_story_approved", role=claims["role"], actor_id=UUID(claims["sub"]), detail=story.story_title)
    db.commit()
    db.refresh(story)
    return story


@router.post("/{story_id}/reject", response_model=SurvivorStoryOut)
@limiter.limit("30/minute")
def reject_survivor_story(
    request: Request,
    story_id: UUID,
    payload: SurvivorStoryRejectIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    story = _get_pending_story_or_404(db, story_id)
    story.status = "Rejected"
    story.rejection_reason = payload.reason
    story.reviewed_at = datetime.now(timezone.utc)
    record_event(db, "survivor_story_rejected", role=claims["role"], actor_id=UUID(claims["sub"]), detail=story.story_title)
    db.commit()
    db.refresh(story)
    return story
