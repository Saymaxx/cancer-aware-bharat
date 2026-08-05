from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel
from app.schemas.event import EventOut


class VolunteerCampaignEnrollmentOut(CamelModel):
    id: UUID
    event_id: UUID
    status: str
    decision_notes: str | None = None
    enrolled_at: datetime
    checked_in_at: datetime | None = None
    event: EventOut


class VolunteerBrief(CamelModel):
    id: UUID
    name: str
    email: str


class VolunteerCampaignEnrollmentAdminOut(VolunteerCampaignEnrollmentOut):
    """Same shape as VolunteerCampaignEnrollmentOut plus who's asking --
    used by the Admin/SuperAdmin pending-approvals queue."""

    volunteer: VolunteerBrief


class VolunteerCampaignEnrollmentRejectIn(CamelModel):
    reason: str = Field(min_length=1, max_length=2000)
