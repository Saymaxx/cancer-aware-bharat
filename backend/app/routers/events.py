from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.deps import DbSession
from app.models.event import Event
from app.schemas.event import EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventOut])
def list_events(db: DbSession):
    return db.query(Event).order_by(Event.created_at.desc()).all()


@router.get("/{event_id}", response_model=EventOut)
def get_event(event_id: UUID, db: DbSession):
    event = db.query(Event).filter(Event.id == event_id).first()
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Event not found")
    return event
