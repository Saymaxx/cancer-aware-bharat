import uuid
from datetime import datetime

from sqlalchemy import Boolean, String, Numeric, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

DONOR_TYPES = ("Individual", "Corporate", "Foundation", "NGO")
PAYMENT_METHODS = ("UPI", "Net Banking", "Card", "Cheque", "Razorpay")


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_name: Mapped[str] = mapped_column(String(200), nullable=False)
    donor_type: Mapped[str] = mapped_column(String(20), nullable=False)
    # Numeric, not Float -- same rationale as PatientRecord.financial_aid_amount.
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(String(20), nullable=False)
    # No real receipt-email integration exists yet -- this just records that
    # a receipt was marked sent.
    receipt_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    sponsorship_campaign: Mapped[str | None] = mapped_column(String(255))
    # Only populated for real online donations (payment_method="Razorpay")
    # made through the public checkout flow -- staff manual-entry rows leave
    # these null, same as they always have.
    donor_email: Mapped[str | None] = mapped_column(String(255))
    donor_phone: Mapped[str | None] = mapped_column(String(30))
    razorpay_order_id: Mapped[str | None] = mapped_column(String(64))
    # Unique + used for idempotency in /donations/verify -- a client retry
    # after a network hiccup must not create a second Donation row for the
    # same captured payment.
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(64), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
