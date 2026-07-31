from datetime import datetime
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
    decision_notes: str | None = None
    created_at: datetime


class HospitalRecommendIn(CamelModel):
    notes: str | None = Field(default=None, max_length=2000)


class HospitalRejectIn(CamelModel):
    reason: str = Field(min_length=1, max_length=2000)


class HospitalApproveIn(CamelModel):
    # Fields HospitalPartnerRequest never collected but Hospital requires --
    # the approving superadmin supplies these at approval time.
    region: str = Field(min_length=1, max_length=20)  # north/south/east/west
    state: str = Field(min_length=1, max_length=120)
    type: str = Field(min_length=1, max_length=50)  # 'Center of Excellence' | 'Community Partner'
    address: str = Field(min_length=1, max_length=500)
    lat: float
    lng: float
    notes: str | None = Field(default=None, max_length=2000)


class HospitalApprovalResult(CamelModel):
    hospital: HospitalOut
    # Shown once in this response so the approving admin can relay it to the
    # hospital manually -- no real email-sending channel exists yet (same
    # deliberate limitation as patient OTP delivery). Never stored in
    # plaintext, never logged.
    login_email: str
    temp_password: str
