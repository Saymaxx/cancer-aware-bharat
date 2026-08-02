from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel
from app.schemas.enquiry import PHONE_PATTERN


class VolunteerRegisterIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(pattern=PHONE_PATTERN, max_length=30)
    password: str = Field(min_length=8, max_length=128)
    area: str | None = Field(default=None, max_length=200)
    available_days: list[str] = []
    motivation: str | None = Field(default=None, max_length=2000)


class VolunteerOut(CamelModel):
    id: UUID
    volunteer_id: str
    name: str
    email: EmailStr
    phone: str
    area: str | None = None
    available_days: list[str] = []
    motivation: str | None = None
    status: str
    total_hours: float = 0
    created_at: datetime


class VolunteerRejectIn(CamelModel):
    reason: str = Field(min_length=1, max_length=2000)
