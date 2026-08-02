from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class VolunteerFeedbackIn(CamelModel):
    volunteer_id: UUID | None = None
    volunteer_name: str = Field(min_length=1, max_length=200)
    campaign_name: str = Field(min_length=1, max_length=255)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)


# volunteer_id/volunteer_name are omitted here and derived server-side from
# the authenticated volunteer -- unlike VolunteerFeedbackIn, which is the
# admin-entry form where those fields describe someone else.
class VolunteerFeedbackSubmitIn(CamelModel):
    campaign_name: str = Field(min_length=1, max_length=255)
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=2000)


class VolunteerFeedbackRespondIn(CamelModel):
    response: str = Field(min_length=1, max_length=2000)


class VolunteerFeedbackOut(CamelModel):
    id: UUID
    volunteer_id: UUID | None = None
    volunteer_name: str
    campaign_name: str
    rating: int
    comment: str
    status: str
    response: str | None = None
    created_at: datetime
