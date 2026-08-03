import uuid
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

AVAILABILITY_STATUSES = ("Available", "In Surgery", "On Leave")


class HospitalDoctor(Base):
    """A hospital's own roster of doctors -- self-managed by the hospital
    account, not by Admin/SuperAdmin. assignedPatientsCount is computed at
    read time from PatientRecord.assigned_doctor_id (see Phase N3), not
    stored here."""

    __tablename__ = "hospital_doctors"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=False, index=True)

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    specialty: Mapped[str] = mapped_column(String(200), nullable=False)
    qualification: Mapped[str] = mapped_column(String(200), nullable=False)
    experience_years: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    availability: Mapped[str] = mapped_column(String(20), nullable=False, default="Available")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
