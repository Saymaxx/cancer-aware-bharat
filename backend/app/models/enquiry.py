import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

ENQUIRY_STATUSES = (
    "Pending Admin Review",
    "Rejected by Admin",
    "Approved by Admin",
    "Pending Hospital Assignment",
    "Assigned to Hospital",
    "Declined by Hospital",
    "Accepted by Hospital",
    "Appointment Confirmed",
    "Completed",
)


class PatientEnquiry(Base):
    __tablename__ = "patient_enquiries"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enquiry_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # ENQ-2026-xxxxx
    reference_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # PAT-2026-xxxxx

    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255))
    address: Mapped[str | None] = mapped_column(String(500))
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str | None] = mapped_column(String(120))
    preferred_location: Mapped[str | None] = mapped_column(String(120))

    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    cancer_type: Mapped[str | None] = mapped_column(String(255))
    symptoms: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)

    hospital_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"))
    # Deliberately denormalized, not a bug: a case should show the hospital
    # name as it was communicated to the patient at assignment time, not
    # retroactively rewritten if the hospital later renames. Do not "fix"
    # this into a live join on hospital_id -- that would silently break
    # historical accuracy for already-decided cases.
    preferred_hospital_name: Mapped[str | None] = mapped_column(String(255))
    assigned_hospital_name: Mapped[str | None] = mapped_column(String(255))
    preferred_date: Mapped[str | None] = mapped_column(String(30))

    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Pending Admin Review")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Normal")  # Normal/Urgent/Critical

    # Decision snapshots (denormalized for quick read, mirrors frontend PatientEnquiry type).
    # The *_by columns stay free-text display snapshots deliberately (same
    # pattern as assigned_hospital_name -- a case should show the name as it
    # was at decision time). The *_by_id FK columns alongside them are what's
    # new: User.name has no uniqueness constraint, so two staff sharing a
    # display name previously made "who approved this" genuinely ambiguous;
    # the FK lets it be traced to the exact user row regardless.
    admin_decided_by: Mapped[str | None] = mapped_column(String(200))
    admin_decided_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    admin_decided_at: Mapped[str | None] = mapped_column(String(50))
    admin_action: Mapped[str | None] = mapped_column(String(20))  # Approve/Reject
    admin_remarks: Mapped[str | None] = mapped_column(Text)

    super_admin_assigned_by: Mapped[str | None] = mapped_column(String(200))
    super_admin_assigned_by_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    super_admin_assigned_at: Mapped[str | None] = mapped_column(String(50))
    super_admin_remarks: Mapped[str | None] = mapped_column(Text)

    hospital_decided_by: Mapped[str | None] = mapped_column(String(200))
    hospital_decided_at: Mapped[str | None] = mapped_column(String(50))
    hospital_action: Mapped[str | None] = mapped_column(String(20))  # Accept/Decline
    hospital_remarks: Mapped[str | None] = mapped_column(Text)

    date: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    hospital = relationship("Hospital", back_populates="enquiries")
    # cascade="all, delete-orphan" below is currently unexercised dead code:
    # no DELETE /enquiries/{id} endpoint exists anywhere to trigger it (a
    # patient-record system deliberately has no hard-delete path). Left in
    # place because it's the correct behavior *if* a delete endpoint is ever
    # added, but untested until then -- verify it before relying on it.
    timeline = relationship("TimelineEvent", back_populates="enquiry", cascade="all, delete-orphan", order_by="TimelineEvent.created_at")
    uploaded_reports = relationship("UploadedReport", back_populates="enquiry", cascade="all, delete-orphan")
    appointment = relationship("AppointmentDetails", back_populates="enquiry", uselist=False, cascade="all, delete-orphan")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enquiry_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patient_enquiries.id"), nullable=False)
    stage: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    actor: Mapped[str | None] = mapped_column(String(200))
    remarks: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    enquiry = relationship("PatientEnquiry", back_populates="timeline")


class UploadedReport(Base):
    __tablename__ = "uploaded_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enquiry_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patient_enquiries.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    size: Mapped[str | None] = mapped_column(String(30))
    type: Mapped[str | None] = mapped_column(String(100))
    # Server-local storage path only -- never returned to clients directly
    # (UploadedReportOut.url is a computed authenticated-download-route path
    # instead; see app/routers/enquiries.py's download endpoint).
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    enquiry = relationship("PatientEnquiry", back_populates="uploaded_reports")


class AppointmentDetails(Base):
    __tablename__ = "appointments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # APT-2026-xxxxx
    enquiry_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patient_enquiries.id"), unique=True, nullable=False)
    hospital_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=False)
    hospital_name: Mapped[str] = mapped_column(String(255), nullable=False)
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[str] = mapped_column(String(30), nullable=False)
    time: Mapped[str] = mapped_column(String(30), nullable=False)
    doctor: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="Appointment Confirmed")  # Confirmed/Completed/Cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    enquiry = relationship("PatientEnquiry", back_populates="appointment")
