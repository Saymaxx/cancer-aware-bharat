from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.core.limiter import limiter
from app.core.storage import ALLOWED_REPORT_TYPES, MAX_REPORT_BYTES, get_storage, matches_declared_type
from app.deps import DbSession, current_hospital_id
from app.models.hospital_doctor import HospitalDoctor
from app.models.hospital_report import REPORT_TYPES, HospitalReport
from app.models.patient_record import PatientRecord
from app.schemas.hospital_report import HospitalReportOut

router = APIRouter(prefix="/hospital-reports", tags=["hospital-reports"])


def _get_own_patient_record_or_404(db: Session, hospital_id: UUID, record_id: UUID) -> PatientRecord:
    record = (
        db.query(PatientRecord)
        .filter(PatientRecord.id == record_id, PatientRecord.hospital_id == hospital_id)
        .first()
    )
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient record not found")
    return record


@router.get("/mine", response_model=list[HospitalReportOut])
@limiter.limit("60/minute")
def list_my_reports(
    request: Request,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
    patient_record_id: UUID | None = Query(default=None, alias="patientRecordId"),
):
    query = db.query(HospitalReport).filter(HospitalReport.hospital_id == hospital_id)
    if patient_record_id is not None:
        query = query.filter(HospitalReport.patient_record_id == patient_record_id)
    return query.order_by(HospitalReport.created_at.desc()).all()


@router.post("/mine", response_model=HospitalReportOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def upload_my_report(
    request: Request,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
    file: UploadFile,
    patient_record_id: Annotated[UUID, Form(alias="patientRecordId")],
    report_type: Annotated[str, Form(alias="reportType")],
    uploaded_by_doctor_id: Annotated[UUID | None, Form(alias="uploadedByDoctorId")] = None,
):
    if report_type not in REPORT_TYPES:
        raise HTTPException(422, f"report_type must be one of {REPORT_TYPES}")

    record = _get_own_patient_record_or_404(db, hospital_id, patient_record_id)

    doctor_name = None
    if uploaded_by_doctor_id is not None:
        doctor = (
            db.query(HospitalDoctor)
            .filter(HospitalDoctor.id == uploaded_by_doctor_id, HospitalDoctor.hospital_id == hospital_id)
            .first()
        )
        if doctor is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Doctor not found")
        doctor_name = doctor.name

    if file.content_type not in ALLOWED_REPORT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF, JPEG, or PNG reports are accepted")

    contents = await file.read(MAX_REPORT_BYTES + 1)
    if len(contents) > MAX_REPORT_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File exceeds the 10 MB limit")
    if not matches_declared_type(contents, file.content_type):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File content doesn't match its declared type")

    safe_filename = Path(file.filename or "").name or "upload"
    storage_key = await run_in_threadpool(get_storage().save, patient_record_id, safe_filename, contents)

    report = HospitalReport(
        patient_record_id=record.id,
        patient_name=record.name,
        hospital_id=hospital_id,
        report_type=report_type,
        uploaded_by_doctor_id=uploaded_by_doctor_id,
        uploaded_by_doctor_name=doctor_name,
        file_name=file.filename or safe_filename,
        file_size=f"{len(contents) / 1024:.1f} KB",
        file_type=file.content_type,
        storage_key=storage_key,
    )
    db.add(report)

    if report_type == "Prescription":
        record.prescription_uploaded = True

    db.commit()
    db.refresh(report)
    return report


@router.get("/mine/{report_id}/download")
@limiter.limit("60/minute")
def download_my_report(
    request: Request,
    report_id: UUID,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    report = (
        db.query(HospitalReport)
        .filter(HospitalReport.id == report_id, HospitalReport.hospital_id == hospital_id)
        .first()
    )
    if report is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")

    try:
        stream = get_storage().open(report.storage_key)
    except FileNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report file is missing from storage")

    def _iter_chunks(chunk_size: int = 64 * 1024):
        try:
            while chunk := stream.read(chunk_size):
                yield chunk
        finally:
            stream.close()

    return StreamingResponse(
        _iter_chunks(),
        media_type=report.file_type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{report.file_name}"'},
    )
