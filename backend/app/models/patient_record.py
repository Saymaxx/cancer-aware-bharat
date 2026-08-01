import uuid
from datetime import datetime

from sqlalchemy import String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

FINANCIAL_AID_STATUSES = ("Not Requested", "Pending Review", "Approved", "Disbursed", "Rejected")
CASE_STATUSES = ("Under Treatment", "Recovered", "Screened - Healthy", "Follow-up")


class PatientRecord(Base):
    """Admin-managed case record (diagnosis, hospital, financial aid) --
    distinct from PatientEnquiry (the intake workflow) and Patient (the
    optional login account). A staff member creates one of these directly
    for a patient they're tracking; it is not derived from an enquiry."""

    __tablename__ = "patient_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    record_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # e.g. CASE-2026-1234567
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    diagnosis: Mapped[str] = mapped_column(String(500), nullable=False)

    hospital_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"), index=True)
    # Denormalized snapshot, not a live join -- matches PatientEnquiry's
    # hospital_name convention (see app/models/enquiry.py): a case record
    # should show the hospital name as it was assigned, not be silently
    # rewritten if that hospital later renames.
    hospital_name: Mapped[str | None] = mapped_column(String(255))

    assigned_volunteer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"))
    assigned_volunteer_name: Mapped[str | None] = mapped_column(String(200))

    financial_aid_status: Mapped[str] = mapped_column(String(30), nullable=False, default="Not Requested")
    # Numeric, not Float (unlike hospital.lat/lng elsewhere): money shouldn't
    # accumulate binary-floating-point rounding error.
    financial_aid_amount: Mapped[float | None] = mapped_column(Numeric(12, 2))
    report_url: Mapped[str | None] = mapped_column(String(1000))
    case_status: Mapped[str] = mapped_column(String(30), nullable=False, default="Under Treatment")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
