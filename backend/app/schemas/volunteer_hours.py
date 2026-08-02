from datetime import date, datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class VolunteerHoursLogIn(CamelModel):
    activity: str = Field(min_length=1, max_length=255)
    hours: float = Field(gt=0, le=24)
    log_date: date


class VolunteerHoursLogOut(CamelModel):
    id: UUID
    volunteer_id: UUID
    activity: str
    hours: float
    log_date: date
    created_at: datetime
