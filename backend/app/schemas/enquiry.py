from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import EmailStr, Field, computed_field

from app.schemas.base import CamelModel

# Mirrors the format already enforced client-side (EnquiryModal uses
# type="tel"); backend had no equivalent, so malformed phone numbers (e.g.
# "abc") previously reached the DB unchecked. Generous enough to allow
# "+91 90000 11111", "(011) 4055-9200", etc.
PHONE_PATTERN = r"^[0-9+\-\s()]{7,20}$"


class UploadedReportOut(CamelModel):
    id: UUID
    enquiry_id: UUID
    name: str
    size: str | None = None
    type: str | None = None
    uploaded_at: datetime

    # Previously this was the raw server filesystem path (a minor info
    # leak) and there was no route that could actually serve it, so the
    # field was non-functional as well. Now it points at a real
    # authenticated download endpoint instead, under the new canonical
    # /v1 prefix (also reachable unprefixed, same as every other route).
    @computed_field  # type: ignore[prop-decorator]
    @property
    def url(self) -> str:
        return f"/v1/enquiries/{self.enquiry_id}/reports/{self.id}/download"


class TimelineEventOut(CamelModel):
    id: UUID
    stage: str
    description: str
    actor: str | None = None
    remarks: str | None = None
    created_at: datetime


class AppointmentDetailsOut(CamelModel):
    id: UUID
    appointment_id: str
    hospital_id: UUID
    hospital_name: str
    patient_name: str
    date: str
    time: str
    doctor: str
    status: str
    created_at: datetime


class PatientEnquiryCreate(CamelModel):
    patient_name: str = Field(min_length=1, max_length=200)
    age: int = Field(ge=1, le=120)
    gender: str = Field(min_length=1, max_length=20)
    phone: str = Field(pattern=PHONE_PATTERN, max_length=30)
    email: EmailStr | None = None
    address: str | None = Field(default=None, max_length=500)
    city: str = Field(min_length=1, max_length=120)
    state: str | None = Field(default=None, max_length=120)
    preferred_location: str | None = Field(default=None, max_length=120)
    reason: str = Field(min_length=1, max_length=255)
    cancer_type: str | None = Field(default=None, max_length=255)
    symptoms: str | None = Field(default=None, max_length=5000)
    notes: str | None = Field(default=None, max_length=5000)
    preferred_hospital_id: UUID | None = None
    preferred_date: str | None = Field(default=None, max_length=30)
    priority: Literal["Normal", "Urgent", "Critical"] | None = None  # server infers if omitted


class PatientEnquiryOut(CamelModel):
    id: UUID
    enquiry_id: str
    reference_number: str
    patient_name: str
    age: int
    gender: str
    phone: str
    email: str | None = None
    address: str | None = None
    city: str
    state: str | None = None
    preferred_location: str | None = None
    reason: str
    cancer_type: str | None = None
    symptoms: str | None = None
    notes: str | None = None
    hospital_id: UUID | None = None
    preferred_hospital_name: str | None = None
    assigned_hospital_name: str | None = None
    preferred_date: str | None = None
    status: str
    priority: str
    date: str
    created_at: datetime
    updated_at: datetime

    uploaded_reports: list[UploadedReportOut] = []
    timeline: list[TimelineEventOut] = []
    appointment: AppointmentDetailsOut | None = None


class AdminDecisionIn(CamelModel):
    remarks: str | None = Field(default=None, max_length=2000)


class AdminRejectIn(CamelModel):
    rejection_reason: str = Field(min_length=1, max_length=2000)


class SuperAdminAssignIn(CamelModel):
    hospital_id: UUID
    remarks: str | None = Field(default=None, max_length=2000)


class HospitalAcceptIn(CamelModel):
    appointment_date: str = Field(min_length=1, max_length=30)
    appointment_time: str = Field(min_length=1, max_length=30)
    doctor_name: str = Field(min_length=1, max_length=200)
    remarks: str | None = Field(default=None, max_length=2000)


class HospitalDeclineIn(CamelModel):
    decline_reason: str = Field(min_length=1, max_length=2000)


class HospitalCompleteIn(CamelModel):
    remarks: str | None = Field(default=None, max_length=2000)


class EnquiryLookupIn(CamelModel):
    reference_number: str = Field(min_length=1, max_length=50)
    phone: str = Field(min_length=1, max_length=30)
