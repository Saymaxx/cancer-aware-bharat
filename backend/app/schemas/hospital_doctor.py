from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel

Availability = Literal["Available", "In Surgery", "On Leave"]


class HospitalDoctorIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    specialty: str = Field(min_length=1, max_length=200)
    qualification: str = Field(min_length=1, max_length=200)
    experience_years: int = Field(default=0, ge=0, le=80)
    phone: str = Field(min_length=1, max_length=30)
    email: EmailStr
    availability: Availability = "Available"


class HospitalDoctorPatch(CamelModel):
    availability: Availability


class HospitalDoctorOut(CamelModel):
    id: UUID
    hospital_id: UUID
    name: str
    specialty: str
    qualification: str
    experience_years: int
    phone: str
    email: str
    availability: str
    # Computed at read time from PatientRecord.assigned_doctor_id once
    # Phase N3 lands that column -- honest 0 until then, not faked.
    assigned_patients_count: int = 0
    created_at: datetime
    updated_at: datetime
