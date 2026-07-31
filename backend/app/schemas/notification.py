from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class NotificationOut(CamelModel):
    id: UUID
    target_role: str
    target_hospital_id: UUID | None = None
    title: str
    message: str
    enquiry_id: str | None = None
    read: bool
    created_at: datetime


class NotificationBroadcastIn(CamelModel):
    audience: Literal["All Users", "Admins", "Volunteers", "Hospitals", "Patients"]
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=2000)


class NotificationBroadcastResult(CamelModel):
    # "Hospitals"/"All Users" fan out to one row per active hospital, so the
    # recipient count isn't 1:1 with "one broadcast" the way every other
    # notify() call site in this app is -- this echoes the real count back
    # instead of the frontend's previous hardcoded audience-size guesses.
    recipient_count: int
