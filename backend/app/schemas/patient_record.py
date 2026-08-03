from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel

FinancialAidStatus = Literal["Not Requested", "Pending Review", "Approved", "Disbursed", "Rejected"]
CaseStatus = Literal["Under Treatment", "Recovered", "Screened - Healthy", "Follow-up"]
TreatmentStatus = Literal["Under Review", "Under Treatment", "Completed", "Referred", "Emergency"]
CostVerificationStatus = Literal["Pending Verification", "Cost Verified"]


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
    ngo_referral_id: UUID | None = None
    treatment_status: str
    cancer_stage: str | None = None
    assigned_doctor_id: UUID | None = None
    assigned_doctor_name: str | None = None
    admission_date: date | None = None
    remarks: str
    prescription_uploaded: bool
    # Computed at read time from real HospitalReport rows (Phase N4) -- see
    # patient_records.py's _out()/_out_many().
    reports_count: int = 0
    estimated_cost: float | None = None
    verified_cost: float | None = None
    # Derived, not stored -- None until estimated_cost is set, then
    # "Pending Verification" until verified_cost is also set.
    cost_verification_status: CostVerificationStatus | None = None
    created_at: datetime
    updated_at: datetime


class PatientRecordHospitalPatch(CamelModel):
    """Partial update for the hospital's own clinical intake fields --
    everything optional so an unset field is left untouched, unlike
    PatientRecordIn's full-overwrite semantics used by Admin."""

    treatment_status: TreatmentStatus | None = None
    cancer_stage: str | None = Field(default=None, max_length=50)
    assigned_doctor_id: UUID | None = None
    admission_date: date | None = None
    remarks: str | None = Field(default=None, max_length=2000)
    estimated_cost: float | None = Field(default=None, ge=0)


class VerifyCostIn(CamelModel):
    verified_amount: float = Field(ge=0)
