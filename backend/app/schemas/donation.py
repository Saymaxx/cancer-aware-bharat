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
