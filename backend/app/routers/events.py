from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request, status

from app.core.limiter import limiter
from app.deps import DbSession
from app.models.event import Event
from app.schemas.event import EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
@limiter.limit("60/minute")
def list_events(
    request: Request,
    db: DbSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return db.query(Event).order_by(Event.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{event_id}", response_model=EventOut)
@limiter.limit("60/minute")
def get_event(request: Request, event_id: UUID, db: DbSession):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event
