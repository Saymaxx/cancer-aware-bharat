from datetime import datetime
from uuid import UUID

from app.schemas.base import CamelModel
from app.schemas.event import EventOut


class VolunteerCampaignEnrollmentOut(CamelModel):
    id: UUID
    event_id: UUID
    enrolled_at: datetime
    checked_in_at: datetime | None = None
    event: EventOut
