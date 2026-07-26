from uuid import UUID

from app.schemas.base import CamelModel


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
    hospital_name: str
    contact_name: str
    designation: str | None = None
    email: str
    phone: str
    city: str
    specialties: str | None = None
    motivation: str | None = None


class HospitalPartnerRequestOut(HospitalPartnerRequestIn):
    id: UUID
    status: str
