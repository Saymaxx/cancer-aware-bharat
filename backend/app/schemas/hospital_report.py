from datetime import datetime
from typing import Literal
from uuid import UUID

from app.schemas.base import CamelModel

ReportType = Literal["Prescription", "Lab Test", "Biopsy", "CT/MRI Scan", "Discharge Summary"]


class HospitalReportOut(CamelModel):
    id: UUID
    patient_record_id: UUID
    patient_name: str
    report_type: str
    uploaded_by_doctor_id: UUID | None = None
    uploaded_by_doctor_name: str | None = None
    file_name: str
    file_size: str
    file_type: str
    created_at: datetime
