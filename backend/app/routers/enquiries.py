import uuid
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.limiter import limiter
from app.deps import (
    DbSession,
    current_hospital_id,
    require_admin_or_superadmin,
    require_roles,
)
from app.models.enquiry import PatientEnquiry, UploadedReport
from app.models.user import User
from app.schemas.enquiry import (
    AdminDecisionIn,
    AdminRejectIn,
    EnquiryLookupIn,
    HospitalAcceptIn,
    HospitalDeclineIn,
    PatientEnquiryCreate,
    PatientEnquiryOut,
    SuperAdminAssignIn,
    UploadedReportOut,
)
from app.services import enquiry_workflow

router = APIRouter(prefix="/enquiries", tags=["enquiries"])

ALLOWED_REPORT_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_REPORT_BYTES = 10 * 1024 * 1024  # 10 MB


def _staff_name(db: Session, claims: dict) -> str:
    user = db.query(User).filter(User.id == UUID(claims["sub"])).first()
    return user.name if user else "Staff"


@router.post("", response_model=PatientEnquiryOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_enquiry(request: Request, payload: PatientEnquiryCreate, db: DbSession):
    """Public endpoint - anyone can submit a patient enquiry, no login required."""
    return enquiry_workflow.submit_enquiry(db, payload)


@router.post("/lookup", response_model=PatientEnquiryOut)
@limiter.limit("20/minute")
def lookup_enquiry(request: Request, payload: EnquiryLookupIn, db: DbSession):
    """Public endpoint - patients check their own status via reference number + phone."""
    enquiry = (
        db.query(PatientEnquiry)
        .filter(
            PatientEnquiry.reference_number == payload.reference_number,
            PatientEnquiry.phone == payload.phone,
        )
        .first()
    )
    if enquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No enquiry found for that reference number and phone")
    return enquiry


@router.get("", response_model=list[PatientEnquiryOut])
def list_enquiries(
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("admin", "superadmin", "hospital"))],
    status_filter: str | None = Query(default=None, alias="status"),
):
    query = db.query(PatientEnquiry)
    if claims["role"] == "hospital":
        query = query.filter(PatientEnquiry.hospital_id == UUID(claims["sub"]))
    if status_filter:
        query = query.filter(PatientEnquiry.status == status_filter)
    return query.order_by(PatientEnquiry.created_at.desc()).all()


@router.get("/{enquiry_id}", response_model=PatientEnquiryOut)
def get_enquiry(
    enquiry_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("admin", "superadmin", "hospital"))],
):
    enquiry = db.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry_id).first()
    if enquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enquiry not found")
    if claims["role"] == "hospital" and enquiry.hospital_id != UUID(claims["sub"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not assigned to your hospital")
    return enquiry


@router.post("/{enquiry_id}/admin-approve", response_model=PatientEnquiryOut)
def admin_approve_enquiry(
    enquiry_id: UUID,
    payload: AdminDecisionIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    return enquiry_workflow.admin_approve(db, enquiry_id, _staff_name(db, claims), payload.remarks)


@router.post("/{enquiry_id}/admin-reject", response_model=PatientEnquiryOut)
def admin_reject_enquiry(
    enquiry_id: UUID,
    payload: AdminRejectIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    return enquiry_workflow.admin_reject(db, enquiry_id, _staff_name(db, claims), payload.rejection_reason)


@router.post("/{enquiry_id}/assign-hospital", response_model=PatientEnquiryOut)
def assign_hospital(
    enquiry_id: UUID,
    payload: SuperAdminAssignIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    return enquiry_workflow.super_admin_assign_hospital(
        db, enquiry_id, payload.hospital_id, _staff_name(db, claims), payload.remarks
    )


@router.post("/{enquiry_id}/hospital-accept", response_model=PatientEnquiryOut)
def hospital_accept_enquiry(
    enquiry_id: UUID,
    payload: HospitalAcceptIn,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    return enquiry_workflow.hospital_accept(
        db, enquiry_id, hospital_id, payload.appointment_date, payload.appointment_time,
        payload.doctor_name, payload.remarks,
    )


@router.post("/{enquiry_id}/hospital-decline", response_model=PatientEnquiryOut)
def hospital_decline_enquiry(
    enquiry_id: UUID,
    payload: HospitalDeclineIn,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    return enquiry_workflow.hospital_decline(db, enquiry_id, hospital_id, payload.decline_reason)


@router.post("/{enquiry_id}/reports", response_model=UploadedReportOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def upload_report(request: Request, enquiry_id: UUID, db: DbSession, file: UploadFile):
    """Public - attached during patient enquiry submission (or added later by reference number)."""
    enquiry = db.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry_id).first()
    if enquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enquiry not found")
    if file.content_type not in ALLOWED_REPORT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF, JPEG, or PNG reports are accepted")

    contents = await file.read(MAX_REPORT_BYTES + 1)
    if len(contents) > MAX_REPORT_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File exceeds the 10 MB limit")

    upload_dir = Path(settings.upload_dir) / str(enquiry_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4()}_{file.filename}"
    (upload_dir / stored_name).write_bytes(contents)

    report = UploadedReport(
        enquiry_id=enquiry.id,
        name=file.filename or stored_name,
        size=f"{len(contents) / 1024:.1f} KB",
        type=file.content_type,
        url=str(upload_dir / stored_name),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report
