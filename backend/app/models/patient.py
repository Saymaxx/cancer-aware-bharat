import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

OTP_PURPOSES = ("verify_email", "password_reset")


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_ref_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # PT-2026-xxxxxxx
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    # Deliberately not unique -- same reasoning as Hospital.email/Volunteer.phone:
    # a shared household phone across two registering patients is plausible,
    # not obviously a data-quality bug.
    phone: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    # The account row exists the moment they register (so a registration OTP
    # has something real to attach to), but login is blocked until this is
    # True -- see auth.py's patient_login, mirroring hospital_login's
    # is_active gate.
    email_verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OtpCode(Base):
    """Short-lived, single-use codes for patient email verification and
    password reset. Real protection here is expiry + single-use + an
    attempt-count lockout, not hash cost -- a 6-digit code's keyspace makes
    bcrypt-style slow hashing pointless overhead, so code_hash is a plain
    sha256 digest (see app/core/otp.py)."""

    __tablename__ = "otp_codes"
    __table_args__ = (
        CheckConstraint(
            "purpose IN ('" + "', '".join(OTP_PURPOSES) + "')",
            name="ck_otp_codes_purpose",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("patients.id"), nullable=False, index=True)
    purpose: Mapped[str] = mapped_column(String(20), nullable=False)  # see OTP_PURPOSES
    code_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
