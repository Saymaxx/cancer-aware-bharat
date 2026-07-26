from uuid import UUID

from app.schemas.base import CamelModel


class EventOut(CamelModel):
    id: UUID
    title: str
    type: str
    image: str | None = None
    date: str
    time: str
    location: str
    description: str = ""
    category: str
    registered_count: int = 0
    capacity: int = 0
