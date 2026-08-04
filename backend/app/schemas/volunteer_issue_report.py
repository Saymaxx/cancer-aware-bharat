from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class VolunteerIssueReportSubmitIn(CamelModel):
    category: str = Field(min_length=1, max_length=100)
    description: str = Field(min_length=1, max_length=2000)


class VolunteerIssueReportResolveIn(CamelModel):
    resolution_notes: str | None = Field(default=None, max_length=2000)


class VolunteerIssueReportOut(CamelModel):
    id: UUID
    volunteer_id: UUID
    volunteer_name: str
    category: str
    description: str
    status: str
    resolution_notes: str | None = None
    created_at: datetime
