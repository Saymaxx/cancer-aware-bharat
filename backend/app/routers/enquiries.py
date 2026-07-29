from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, selectinload
from starlette.concurrency import run_in_threadpool

from app.core.limiter import limiter
from app.core.storage import get_storage
from app.deps import (
    DbSession,
    current_hospital_id,
    optional_patient_id,
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
    HospitalCompleteIn,
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

# Magic-byte signatures for the 3 types we accept. The client-supplied
# Content-Type header is trivially spoofable (it's just a form field), so it
# can only be used to pick a signature to check against, never trusted on
# its own.
_MAGIC_SIGNATURES: dict[str, tuple[bytes, ...]] = {
    "application/pdf": (b"%PDF-",),
    "image/jpeg": (b"\xff\xd8\xff",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
}


def _matches_declared_type(contents: bytes, declared_type: str) -> bool:
    signatures = _MAGIC_SIGNATURES.get(declared_type, ())
    return any(contents.startswith(sig) for sig in signatures)


def _staff_name(db: Session, claims: dict) -> str:
    user = db.query(User).filter(User.id == UUID(claims["sub"])).first()
    return user.name if user else "Staff"


@router.post("", response_model=PatientEnquiryOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_enquiry(
    request: Request,
    payload: PatientEnquiryCreate,
    db: DbSession,
    patient_id: Annotated[UUID | None, Depends(optional_patient_id)] = None,
):
    """Public endpoint - anyone can submit a patient enquiry, no login required.

    If a valid patient Bearer token happens to be present, the new enquiry
    is automatically linked to that account -- guest submissions (still the
    common case) stay fully anonymous exactly as before.
    """
    return enquiry_workflow.submit_enquiry(db, payload, patient_id=patient_id)


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
@limiter.limit("60/minute")
def list_enquiries(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("admin", "superadmin", "hospital"))],
    status_filter: str | None = Query(default=None, alias="status"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    # selectinload avoids an N+1: without it, each enquiry's timeline,
    # uploaded_reports, and appointment lazy-load with a separate query per
    # row while PatientEnquiryOut serializes the list (100 enquiries would
    # be 300+ queries). skip/limit cap the result set so this endpoint can
    # never return an unbounded, ever-growing table in one response.
    query = db.query(PatientEnquiry).options(
        selectinload(PatientEnquiry.timeline),
        selectinload(PatientEnquiry.uploaded_reports),
        selectinload(PatientEnquiry.appointment),
    )
    if claims["role"] == "hospital":
        query = query.filter(PatientEnquiry.hospital_id == UUID(claims["sub"]))
    if status_filter:
        query = query.filter(PatientEnquiry.status == status_filter)
    return query.order_by(PatientEnquiry.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{enquiry_id}", response_model=PatientEnquiryOut)
@limiter.limit("60/minute")
def get_enquiry(
    request: Request,
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
@limiter.limit("30/minute")
def admin_approve_enquiry(
    request: Request,
    enquiry_id: UUID,
    payload: AdminDecisionIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    return enquiry_workflow.admin_approve(db, enquiry_id, _staff_name(db, claims), UUID(claims["sub"]), payload.remarks)


@router.post("/{enquiry_id}/admin-reject", response_model=PatientEnquiryOut)
@limiter.limit("30/minute")
def admin_reject_enquiry(
    request: Request,
    enquiry_id: UUID,
    payload: AdminRejectIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    return enquiry_workflow.admin_reject(db, enquiry_id, _staff_name(db, claims), UUID(claims["sub"]), payload.rejection_reason)


@router.post("/{enquiry_id}/assign-hospital", response_model=PatientEnquiryOut)
@limiter.limit("30/minute")
def assign_hospital(
    request: Request,
    enquiry_id: UUID,
    payload: SuperAdminAssignIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    return enquiry_workflow.super_admin_assign_hospital(
        db, enquiry_id, payload.hospital_id, _staff_name(db, claims), UUID(claims["sub"]), payload.remarks
    )


@router.post("/{enquiry_id}/hospital-accept", response_model=PatientEnquiryOut)
@limiter.limit("30/minute")
def hospital_accept_enquiry(
    request: Request,
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
@limiter.limit("30/minute")
def hospital_decline_enquiry(
    request: Request,
    enquiry_id: UUID,
    payload: HospitalDeclineIn,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    return enquiry_workflow.hospital_decline(db, enquiry_id, hospital_id, payload.decline_reason)


@router.post("/{enquiry_id}/complete", response_model=PatientEnquiryOut)
@limiter.limit("30/minute")
def complete_treatment(
    request: Request,
    enquiry_id: UUID,
    payload: HospitalCompleteIn,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    return enquiry_workflow.hospital_complete_treatment(db, enquiry_id, hospital_id, payload.remarks)


@router.post("/{enquiry_id}/reports", response_model=UploadedReportOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def upload_report(
    request: Request,
    enquiry_id: UUID,
    db: DbSession,
    file: UploadFile,
    phone: Annotated[str, Form()],
):
    """Public - attached during patient enquiry submission (or added later by reference number).

    Requires the enquiry's own phone number as ownership proof (mirroring
    /enquiries/lookup's reference-number+phone check) -- otherwise the
    enquiry UUID alone would let anyone who obtains/guesses it attach files
    to that patient's medical record indefinitely.
    """
    enquiry = db.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry_id).first()
    if enquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enquiry not found")
    if enquiry.phone != phone:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Phone number does not match this enquiry")
    if file.content_type not in ALLOWED_REPORT_TYPES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Only PDF, JPEG, or PNG reports are accepted")

    contents = await file.read(MAX_REPORT_BYTES + 1)
    if len(contents) > MAX_REPORT_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File exceeds the 10 MB limit")
    if not _matches_declared_type(contents, file.content_type):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "File content doesn't match its declared type")

    # file.filename is fully client-controlled. Path(...).name strips any
    # directory components (e.g. "../../etc/passwd" -> "passwd"), so the
    # write can never escape upload_dir no matter what a client sends (and,
    # for the s3 backend, can't be used to write outside the reports/
    # prefix either).
    safe_filename = Path(file.filename or "").name or "upload"
    # save() does blocking I/O (a disk write, or an S3 network round-trip) --
    # run_in_threadpool keeps that off the event loop instead of stalling
    # every other concurrent request for the duration of the call.
    storage_key = await run_in_threadpool(get_storage().save, enquiry_id, safe_filename, contents)

    report = UploadedReport(
        enquiry_id=enquiry.id,
        name=file.filename or safe_filename,
        size=f"{len(contents) / 1024:.1f} KB",
        type=file.content_type,
        url=storage_key,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{enquiry_id}/reports/{report_id}/download")
@limiter.limit("60/minute")
def download_report(
    request: Request,
    enquiry_id: UUID,
    report_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("admin", "superadmin", "hospital", "patient"))],
):
    """Replaces the previous raw-filesystem-path exposure (UploadedReportOut.url)
    with a real, access-controlled route -- same role/ownership rules as
    viewing the enquiry itself.
    """
    enquiry = db.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry_id).first()
    if enquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enquiry not found")
    if claims["role"] == "hospital" and enquiry.hospital_id != UUID(claims["sub"]):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not assigned to your hospital")
    if claims["role"] == "patient" and enquiry.patient_id != UUID(claims["sub"]):
        # patient_id is only populated once GET /patients/me/enquiries has
        # been called (auto-link on submission, or opportunistic backfill
        # for older phone-matched rows) -- a patient viewing their own
        # dashboard hits that first, so this is the expected path, not an
        # edge case.
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your enquiry")

    report = (
        db.query(UploadedReport)
        .filter(UploadedReport.id == report_id, UploadedReport.enquiry_id == enquiry_id)
        .first()
    )
    if report is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report not found")

    # Opened eagerly (not inside the generator below) so a missing object
    # still 404s cleanly -- once StreamingResponse starts, headers are
    # already committed and there's no way to turn a FileNotFoundError here
    # into anything but a broken, half-sent response.
    try:
        stream = get_storage().open(report.url)
    except FileNotFoundError:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Report file is missing from storage")

    def _iter_chunks(chunk_size: int = 64 * 1024):
        try:
            while chunk := stream.read(chunk_size):
                yield chunk
        finally:
            stream.close()

    # Content-Disposition is built by hand (StreamingResponse, unlike
    # FileResponse, doesn't set it for us); report.name is client-controlled
    # from the original upload, so strip CR/LF and escape quotes rather than
    # trust it verbatim in a header value.
    safe_name = report.name.replace('"', "'").replace("\r", "").replace("\n", "")
    return StreamingResponse(
        _iter_chunks(),
        media_type=report.type or "application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}"'},
    )
