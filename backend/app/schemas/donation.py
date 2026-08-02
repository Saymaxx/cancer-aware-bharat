from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel

DonorType = Literal["Individual", "Corporate", "Foundation", "NGO"]
PaymentMethod = Literal["UPI", "Net Banking", "Card", "Cheque"]


class DonationIn(CamelModel):
    donor_name: str = Field(min_length=1, max_length=200)
    donor_type: DonorType
    amount: float = Field(gt=0)
    payment_method: PaymentMethod
    sponsorship_campaign: str | None = Field(default=None, max_length=255)


class DonationOut(CamelModel):
    id: UUID
    donor_name: str
    donor_type: str
    amount: float
    payment_method: str
    receipt_sent: bool
    sponsorship_campaign: str | None = None
    created_at: datetime


class DonationCheckoutIn(CamelModel):
    amount: float = Field(gt=0, le=1_000_000)
    donor_name: str = Field(min_length=1, max_length=200)
    donor_email: str = Field(min_length=3, max_length=255)
    donor_phone: str | None = Field(default=None, max_length=30)
    donor_type: DonorType = "Individual"


class DonationCheckoutOut(CamelModel):
    order_id: str
    amount_paise: int
    currency: str
    key_id: str


class DonationVerifyIn(CamelModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    donor_name: str = Field(min_length=1, max_length=200)
    donor_email: str = Field(min_length=3, max_length=255)
    donor_phone: str | None = Field(default=None, max_length=30)
    donor_type: DonorType = "Individual"
    amount: float = Field(gt=0)
    sponsorship_campaign: str | None = Field(default=None, max_length=255)
