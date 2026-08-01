from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel

FinancialAidStatus = Literal["Not Requested", "Pending Review", "Approved", "Disbursed", "Rejected"]
CaseStatus = Literal["Under Treatment", "Recovered", "Screened - Healthy", "Follow-up"]


class PatientRecordIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    age: int = Field(ge=0, le=130)
    gender: str = Field(min_length=1, max_length=20)
    diagnosis: str = Field(min_length=1, max_length=500)
    hospital_id: UUID | None = None
    hospital_name: str | None = Field(default=None, max_length=255)
    financial_aid_status: FinancialAidStatus = "Not Requested"
    financial_aid_amount: float | None = Field(default=None, ge=0)
    case_status: CaseStatus = "Under Treatment"


class PatientRecordOut(CamelModel):
    id: UUID
    record_id: str
    name: str
    age: int
    gender: str
    diagnosis: str
    hospital_id: UUID | None = None
    hospital_name: str | None = None
    assigned_volunteer_id: UUID | None = None
    assigned_volunteer_name: str | None = None
    financial_aid_status: str
    financial_aid_amount: float | None = None
    report_url: str | None = None
    case_status: str
    created_at: datetime
    updated_at: datetime
