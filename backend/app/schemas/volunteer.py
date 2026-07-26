from datetime import datetime
from uuid import UUID

from pydantic import EmailStr

from app.schemas.base import CamelModel


class VolunteerRegisterIn(CamelModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    area: str | None = None
    available_days: list[str] = []
    motivation: str | None = None


class VolunteerOut(CamelModel):
    id: UUID
    volunteer_id: str
    name: str
    email: EmailStr
    phone: str
    area: str | None = None
    available_days: list[str] = []
    motivation: str | None = None
    created_at: datetime
