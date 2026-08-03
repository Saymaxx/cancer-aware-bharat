from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, current_hospital_id, require_admin_or_superadmin
from app.models.event import Event
from app.schemas.event import EventIn, EventOut
from app.services.audit import record_event

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/mine", response_model=list[EventOut])
@limiter.limit("60/minute")
def list_my_events(
    request: Request,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    """Awareness drives/camps specifically co-hosted with this hospital --
    a strict subset of the public GET /events list (see Event.hospital_id)."""
    return (
        db.query(Event)
        .filter(Event.hospital_id == hospital_id)
        .order_by(Event.created_at.desc())
        .all()
    )


@router.get("", response_model=list[EventOut])
@limiter.limit("60/minute")
def list_events(
    request: Request,
    response: Response,
    db: DbSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    # Public, unauthenticated, and slow-changing -- see hospitals.py for
    # why this is safe to cache unlike everything else (main.py's default).
    response.headers["Cache-Control"] = "public, max-age=60"
    return db.query(Event).order_by(Event.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{event_id}", response_model=EventOut)
@limiter.limit("60/minute")
def get_event(request: Request, response: Response, event_id: UUID, db: DbSession):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    response.headers["Cache-Control"] = "public, max-age=60"
    return event


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_event(
    request: Request,
    payload: EventIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    event = Event(**payload.model_dump())
    db.add(event)
    record_event(db, "event_created", role=claims["role"], actor_id=UUID(claims["sub"]), detail=event.title)
    db.commit()
    db.refresh(event)
    return event


def _get_event_or_404(db: Session, event_id: UUID) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event


@router.patch("/{event_id}", response_model=EventOut)
@limiter.limit("30/minute")
def update_event(
    request: Request,
    event_id: UUID,
    payload: EventIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    event = _get_event_or_404(db, event_id)
    for field, value in payload.model_dump().items():
        setattr(event, field, value)
    record_event(db, "event_updated", role=claims["role"], actor_id=UUID(claims["sub"]), detail=event.title)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_event(
    request: Request,
    event_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    event = _get_event_or_404(db, event_id)
    record_event(db, "event_deleted", role=claims["role"], actor_id=UUID(claims["sub"]), detail=event.title)
    db.delete(event)
    db.commit()
