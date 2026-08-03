import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

REPORT_TYPES = ("Prescription", "Lab Test", "Biopsy", "CT/MRI Scan", "Discharge Summary")


class HospitalReport(Base):
    """A medical document a hospital uploads for one of its own assigned
    patients (Phase N4) -- distinct from enquiry.UploadedReport, which is
    attached by/for a patient during the intake workflow, before any
    hospital is involved."""

    __tablename__ = "hospital_reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_record_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patient_records.id"), nullable=False, index=True)
    # Both denormalized from the patient_record at upload time, matching
    # hospital_name/assigned_doctor_name's convention elsewhere -- avoids a
    # join on every list call and shows the name as it was at upload time.
    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    hospital_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=False, index=True)

    report_type: Mapped[str] = mapped_column(String(30), nullable=False)
    uploaded_by_doctor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("hospital_doctors.id"))
    uploaded_by_doctor_name: Mapped[str | None] = mapped_column(String(200))

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size: Mapped[str] = mapped_column(String(30), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Opaque storage key from get_storage().save() -- same convention as
    # enquiry.UploadedReport.url, never returned to clients directly.
    storage_key: Mapped[str] = mapped_column(String(1000), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
