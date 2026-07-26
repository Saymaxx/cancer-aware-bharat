import uuid
from datetime import datetime

from sqlalchemy import String, Float, Text, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    logo: Mapped[str | None] = mapped_column(String(1000))
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'Center of Excellence' | 'Community Partner'
    region: Mapped[str] = mapped_column(String(20), nullable=False)  # north/south/east/west
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str] = mapped_column(String(120), nullable=False)
    specialties: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")

    # Portal login (issued after partner request is approved)
    login_email: Mapped[str | None] = mapped_column(String(255), unique=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    enquiries = relationship("PatientEnquiry", back_populates="hospital")


class HospitalPartnerRequest(Base):
    """Application submitted by a hospital wanting to join the network."""

    __tablename__ = "hospital_partner_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    hospital_name: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(200), nullable=False)
    designation: Mapped[str | None] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    specialties: Mapped[str | None] = mapped_column(Text)
    motivation: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="Pending")  # 'Pending' | 'Approved'
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
