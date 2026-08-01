from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel

EventStatus = Literal["Scheduled", "Completed", "Cancelled"]


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
    status: str


# type/category are plain strings, not a Literal -- see the same note on
# BlogArticleIn; there's no DB CHECK constraint backing either field.
# status IS CHECK-constrained (added fresh in Phase I, no legacy rows to
# conflict with), so it gets the usual Literal treatment.
class EventIn(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=50)
    image: str | None = Field(default=None, max_length=500)
    date: str = Field(min_length=1, max_length=50)
    time: str = Field(min_length=1, max_length=50)
    location: str = Field(min_length=1, max_length=255)
    description: str = Field(default="", max_length=2000)
    category: str = Field(min_length=1, max_length=100)
    registered_count: int = Field(default=0, ge=0)
    capacity: int = Field(default=0, ge=0)
    status: EventStatus = "Scheduled"
