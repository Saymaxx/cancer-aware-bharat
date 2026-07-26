from datetime import datetime
from uuid import UUID

from app.schemas.base import CamelModel


class UploadedReportOut(CamelModel):
    id: UUID
    name: str
    size: str | None = None
    type: str | None = None
    url: str
    uploaded_at: datetime


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
    preferred_hospital_id: UUID | None = None
    preferred_date: str | None = None
    priority: str | None = None  # 'Normal' | 'Urgent' | 'Critical'; server infers if omitted


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
    remarks: str | None = None


class AdminRejectIn(CamelModel):
    rejection_reason: str


class SuperAdminAssignIn(CamelModel):
    hospital_id: UUID
    remarks: str | None = None


class HospitalAcceptIn(CamelModel):
    appointment_date: str
    appointment_time: str
    doctor_name: str
    remarks: str | None = None


class HospitalDeclineIn(CamelModel):
    decline_reason: str


class EnquiryLookupIn(CamelModel):
    reference_number: str
    phone: str
