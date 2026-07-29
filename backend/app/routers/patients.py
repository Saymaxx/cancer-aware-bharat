from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session, selectinload

from app.core.limiter import limiter
from app.core.otp import MAX_OTP_ATTEMPTS, OTP_TTL_MINUTES, generate_otp_code, get_otp_sender, hash_otp_code, verify_otp_hash
from app.core.security import create_access_token, generate_numeric_id, hash_password
from app.deps import DbSession, require_patient
from app.models.enquiry import PatientEnquiry
from app.models.patient import OtpCode, Patient
from app.schemas.auth import TokenOut
from app.schemas.enquiry import PatientEnquiryOut
from app.schemas.patient import (
    MessageOut,
    PatientOut,
    PatientProfileUpdateIn,
    PatientRegisterIn,
    RequestPasswordResetIn,
    ResetPasswordIn,
    VerifyEmailIn,
)

router = APIRouter(prefix="/patients", tags=["patients"])

_OTP_TTL = timedelta(minutes=OTP_TTL_MINUTES)


def _issue_otp(db: Session, patient: Patient, purpose: str) -> None:
    code = generate_otp_code()
    db.add(OtpCode(
        patient_id=patient.id,
        purpose=purpose,
        code_hash=hash_otp_code(code),
        expires_at=datetime.now(timezone.utc) + _OTP_TTL,
    ))
    get_otp_sender().send(patient.email, code, purpose)


def _consume_valid_otp(db: Session, patient: Patient, purpose: str, code: str) -> OtpCode:
    otp = (
        db.query(OtpCode)
        .filter(
            OtpCode.patient_id == patient.id,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .order_by(OtpCode.created_at.desc())
        .first()
    )
    now = datetime.now(timezone.utc)
    if otp is None or otp.expires_at < now:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")
    if otp.attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "Too many incorrect attempts -- request a new code")
    if not verify_otp_hash(code, otp.code_hash):
        otp.attempts += 1
        db.commit()
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")
    otp.consumed_at = now
    return otp


@router.post("/register", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def patient_register(request: Request, payload: PatientRegisterIn, db: DbSession):
    """Creates the account immediately (so an OTP has a real row to attach
    to) but leaves it unverified -- POST /auth/patient/login refuses to
    issue a token until /patients/verify-email succeeds, matching
    hospital_login's is_active gate."""
    if db.query(Patient).filter(Patient.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    year = datetime.now(timezone.utc).year
    patient = Patient(
        patient_ref_id=f"PT-{year}-{generate_numeric_id()}",
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        email_verified=False,
    )
    db.add(patient)
    db.flush()

    _issue_otp(db, patient, "verify_email")

    db.commit()
    db.refresh(patient)
    return patient


@router.post("/verify-email", response_model=TokenOut)
@limiter.limit("10/minute")
def verify_email(request: Request, payload: VerifyEmailIn, db: DbSession):
    """Auto-logs in on success, matching the register-then-login UX every
    other role's auth page already has."""
    patient = db.query(Patient).filter(Patient.email == payload.email).first()
    if patient is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")

    _consume_valid_otp(db, patient, "verify_email", payload.code)
    patient.email_verified = True
    db.commit()

    token = create_access_token(subject=str(patient.id), role="patient")
    return TokenOut(access_token=token, role="patient", name=patient.name)


@router.post("/forgot-password/request", response_model=MessageOut)
@limiter.limit("5/hour")
def forgot_password_request(request: Request, payload: RequestPasswordResetIn, db: DbSession):
    # Always the same response whether or not the email matches an account --
    # varying it would let an attacker enumerate registered patient emails.
    generic_message = MessageOut(message="If an account exists for that email, a verification code has been sent.")
    patient = db.query(Patient).filter(Patient.email == payload.email).first()
    if patient is None:
        return generic_message
    _issue_otp(db, patient, "password_reset")
    db.commit()
    return generic_message


@router.post("/forgot-password/reset", response_model=MessageOut)
@limiter.limit("10/minute")
def forgot_password_reset(request: Request, payload: ResetPasswordIn, db: DbSession):
    patient = db.query(Patient).filter(Patient.email == payload.email).first()
    if patient is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired code")
    _consume_valid_otp(db, patient, "password_reset", payload.code)
    patient.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageOut(message="Password updated -- you can now log in with your new password.")


@router.get("/me", response_model=PatientOut)
@limiter.limit("60/minute")
def get_my_profile(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_patient)]):
    patient = db.query(Patient).filter(Patient.id == UUID(claims["sub"])).first()
    if patient is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient not found")
    return patient


@router.patch("/me", response_model=PatientOut)
@limiter.limit("30/minute")
def update_my_profile(
    request: Request,
    payload: PatientProfileUpdateIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_patient)],
):
    patient = db.query(Patient).filter(Patient.id == UUID(claims["sub"])).first()
    if patient is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient not found")
    if payload.name is not None:
        patient.name = payload.name
    if payload.phone is not None:
        patient.phone = payload.phone
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/me/enquiries", response_model=list[PatientEnquiryOut])
@limiter.limit("60/minute")
def get_my_enquiries(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_patient)]):
    """Matches by patient_id (enquiries submitted while logged in) or phone
    (guest submissions made with the same number before -- or without --
    creating an account), so a patient sees their full history either way."""
    patient = db.query(Patient).filter(Patient.id == UUID(claims["sub"])).first()
    if patient is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient not found")

    enquiries = (
        db.query(PatientEnquiry)
        .options(
            selectinload(PatientEnquiry.timeline),
            selectinload(PatientEnquiry.uploaded_reports),
            selectinload(PatientEnquiry.appointment),
        )
        .filter((PatientEnquiry.patient_id == patient.id) | (PatientEnquiry.phone == patient.phone))
        .order_by(PatientEnquiry.created_at.desc())
        .limit(500)
        .all()
    )

    # Opportunistic backfill: a phone-matched row with no patient_id yet
    # (submitted before this account existed, or as a guest) gets linked now
    # so later permission checks (report downloads) can rely on patient_id
    # alone going forward instead of re-deriving the phone match every time.
    backfilled = False
    for enquiry in enquiries:
        if enquiry.patient_id is None and enquiry.phone == patient.phone:
            enquiry.patient_id = patient.id
            backfilled = True
    if backfilled:
        db.commit()

    return enquiries
