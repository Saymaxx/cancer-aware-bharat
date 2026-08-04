from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class VolunteerTrainingProgressIn(CamelModel):
    progress: int = Field(ge=0, le=100)


class VolunteerTrainingProgressOut(CamelModel):
    id: UUID
    resource_id: str
    progress: int
    completed_at: datetime | None = None
    updated_at: datetime
