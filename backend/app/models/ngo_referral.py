import uuid
from datetime import datetime, date

from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

PRIORITIES = ("Normal", "Urgent", "Critical")
REFERRAL_STATUSES = ("Pending Action", "Accepted", "Declined")


class NgoReferral(Base):
    """A patient referral sent to a specific hospital by CAB's own
    caseworkers (admin/superadmin) -- the hospital only accepts or declines
    it, it doesn't create these itself. Distinct from PatientEnquiry (the
    public intake form) and PatientRecord (a case an admin is tracking
    directly) -- this is specifically the NGO-to-hospital handoff."""

    __tablename__ = "ngo_referrals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"), nullable=False, index=True)

    patient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(String(20), nullable=False)
    referral_date: Mapped[date] = mapped_column(Date, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="Normal")
    cancer_type: Mapped[str] = mapped_column(String(200), nullable=False)
    recommended_department: Mapped[str] = mapped_column(String(200), nullable=False)
    referred_by_ngo_agent: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending Action")
    decline_reason: Mapped[str | None] = mapped_column(String(1000))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
