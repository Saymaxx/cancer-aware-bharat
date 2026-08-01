import uuid
from datetime import datetime

from sqlalchemy import Boolean, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

DONOR_TYPES = ("Individual", "Corporate", "Foundation", "NGO")
PAYMENT_METHODS = ("UPI", "Net Banking", "Card", "Cheque")


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_name: Mapped[str] = mapped_column(String(200), nullable=False)
    donor_type: Mapped[str] = mapped_column(String(20), nullable=False)
    # Numeric, not Float -- same rationale as PatientRecord.financial_aid_amount.
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(20), nullable=False)
    # No real payment/email integration exists yet (same disclosed limitation
    # as ConsoleOtpSender) -- this just records that a receipt was marked sent.
    receipt_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    sponsorship_campaign: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
