from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel

Priority = Literal["Normal", "Urgent", "Critical"]
ReferralStatus = Literal["Pending Action", "Accepted", "Declined"]


class NgoReferralIn(CamelModel):
    hospital_id: UUID
    patient_name: str = Field(min_length=1, max_length=200)
    age: int = Field(ge=0, le=130)
    gender: str = Field(min_length=1, max_length=20)
    referral_date: date
    priority: Priority = "Normal"
    cancer_type: str = Field(min_length=1, max_length=200)
    recommended_department: str = Field(min_length=1, max_length=200)
    referred_by_ngo_agent: str = Field(min_length=1, max_length=200)


class NgoReferralDeclineIn(CamelModel):
    reason: str = Field(min_length=1, max_length=1000)


class NgoReferralOut(CamelModel):
    id: UUID
    hospital_id: UUID
    patient_name: str
    age: int
    gender: str
    referral_date: date
    priority: str
    cancer_type: str
    recommended_department: str
    referred_by_ngo_agent: str
    status: str
    decline_reason: str | None = None
    created_at: datetime
    updated_at: datetime
