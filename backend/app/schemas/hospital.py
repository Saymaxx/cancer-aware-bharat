from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel
from app.schemas.enquiry import PHONE_PATTERN


class HospitalOut(CamelModel):
    id: UUID
    name: str
    logo: str | None = None
    type: str
    region: str
    city: str
    state: str
    specialties: list[str] = []
    phone: str
    email: str
    address: str
    lat: float
    lng: float
    description: str = ""


class HospitalPartnerRequestIn(CamelModel):
    hospital_name: str = Field(min_length=1, max_length=255)
    contact_name: str = Field(min_length=1, max_length=200)
    designation: str | None = Field(default=None, max_length=120)
    email: EmailStr
    phone: str = Field(pattern=PHONE_PATTERN, max_length=30)
    city: str = Field(min_length=1, max_length=120)
    specialties: str | None = Field(default=None, max_length=2000)
    motivation: str | None = Field(default=None, max_length=2000)


class HospitalPartnerRequestOut(HospitalPartnerRequestIn):
    id: UUID
    status: str
