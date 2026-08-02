from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.limiter import get_client_ip, limiter
from app.core.security import create_access_token, generate_numeric_id, hash_password, verify_password
from app.deps import DbSession, get_current_claims, require_admin_or_superadmin
from app.models.hospital import Hospital
from app.models.patient import Patient
from app.models.revoked_token import RevokedToken
from app.models.user import User
from app.models.volunteer import Volunteer
from app.schemas.auth import LoginIn, StaffChangePasswordIn, StaffMeOut, StaffMeUpdateIn, TokenOut
from app.schemas.volunteer import VolunteerOut, VolunteerRegisterIn
from app.services.audit import record_event
from app.services.notifications import notify

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/staff/login", response_model=TokenOut)
@limiter.limit("10/minute")
def staff_login(request: Request, payload: LoginIn, db: DbSession):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        record_event(db, "login_failure", role="staff", detail=payload.email, ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not user.is_active:
        record_event(db, "login_failure", role="staff", actor_id=user.id, detail="account inactive", ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This admin account has been suspended")
    token = create_access_token(subject=str(user.id), role=user.role)
    record_event(db, "login_success", role=user.role, actor_id=user.id, ip_address=get_client_ip(request))
    db.commit()
    return TokenOut(access_token=token, role=user.role, name=user.name)


@router.get("/staff/me", response_model=StaffMeOut)
@limiter.limit("60/minute")
def get_staff_me(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    """Self-service profile -- works for both admin and superadmin, unlike
    /admins which deliberately never lists or manages Super Admin accounts.
    A staff member reading/editing their own record isn't that scenario."""
    user = db.query(User).filter(User.id == UUID(claims["sub"])).first()
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
    return user


@router.patch("/staff/me", response_model=StaffMeOut)
@limiter.limit("15/minute")
def update_staff_me(
    request: Request,
    payload: StaffMeUpdateIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    user = db.query(User).filter(User.id == UUID(claims["sub"])).first()
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
    user.name = payload.name
    record_event(db, "staff_profile_updated", role=claims["role"], actor_id=user.id)
    db.commit()
    db.refresh(user)
    return user


@router.post("/staff/change-password", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("10/minute")
def change_staff_password(
    request: Request,
    payload: StaffChangePasswordIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    user = db.query(User).filter(User.id == UUID(claims["sub"])).first()
    if user is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
    if not verify_password(payload.current_password, user.hashed_password):
        # 400, not 401 -- the request's own Bearer token is perfectly valid
        # here (require_admin_or_superadmin already passed); 401 is reserved
        # for the token itself being invalid/expired, which the frontend's
        # global fetch wrapper treats as "session expired" and force-logs
        # out on. A wrong *current password* field must not trigger that.
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password is incorrect")
    user.hashed_password = hash_password(payload.new_password)
    record_event(db, "staff_password_updated", role=claims["role"], actor_id=user.id, ip_address=get_client_ip(request))
    db.commit()


@router.post("/hospital/login", response_model=TokenOut)
@limiter.limit("10/minute")
def hospital_login(request: Request, payload: LoginIn, db: DbSession):
    hospital = db.query(Hospital).filter(Hospital.login_email == payload.email).first()
    if not hospital or not hospital.hashed_password or not verify_password(payload.password, hospital.hashed_password):
        record_event(db, "login_failure", role="hospital", detail=payload.email, ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not hospital.is_active:
        record_event(db, "login_failure", role="hospital", actor_id=hospital.id, detail="account inactive", ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Hospital account is not active")
    token = create_access_token(subject=str(hospital.id), role="hospital")
    record_event(db, "login_success", role="hospital", actor_id=hospital.id, ip_address=get_client_ip(request))
    db.commit()
    return TokenOut(access_token=token, role="hospital", name=hospital.name)


@router.post("/volunteer/login", response_model=TokenOut)
@limiter.limit("10/minute")
def volunteer_login(request: Request, payload: LoginIn, db: DbSession):
    volunteer = db.query(Volunteer).filter(Volunteer.email == payload.email).first()
    if not volunteer or not verify_password(payload.password, volunteer.hashed_password):
        record_event(db, "login_failure", role="volunteer", detail=payload.email, ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if volunteer.status != "Approved":
        record_event(db, "login_failure", role="volunteer", actor_id=volunteer.id, detail=f"status={volunteer.status}", ip_address=get_client_ip(request))
        db.commit()
        detail = (
            "Your volunteer application is still pending admin approval"
            if volunteer.status == "Pending Approval"
            else "Your volunteer application was not approved"
        )
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail)
    token = create_access_token(subject=str(volunteer.id), role="volunteer")
    record_event(db, "login_success", role="volunteer", actor_id=volunteer.id, ip_address=get_client_ip(request))
    db.commit()
    return TokenOut(access_token=token, role="volunteer", name=volunteer.name)


@router.post("/patient/login", response_model=TokenOut)
@limiter.limit("10/minute")
def patient_login(request: Request, payload: LoginIn, db: DbSession):
    patient = db.query(Patient).filter(Patient.email == payload.email).first()
    if not patient or not verify_password(payload.password, patient.hashed_password):
        record_event(db, "login_failure", role="patient", detail=payload.email, ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not patient.email_verified:
        record_event(db, "login_failure", role="patient", actor_id=patient.id, detail="email not verified", ip_address=get_client_ip(request))
        db.commit()
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Please verify your email before logging in")
    token = create_access_token(subject=str(patient.id), role="patient")
    record_event(db, "login_success", role="patient", actor_id=patient.id, ip_address=get_client_ip(request))
    db.commit()
    return TokenOut(access_token=token, role="patient", name=patient.name)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def logout(request: Request, db: DbSession, claims: Annotated[dict, Depends(get_current_claims)]):
    """Shared across staff/hospital/volunteer -- all three use the same
    Bearer-token scheme. Previously "logout" only did
    localStorage.removeItem on the frontend, so a token copied before
    logout (or simply left in browser history/dev tools) stayed fully
    valid for its whole 8h life. This actually revokes it server-side.
    """
    jti = claims.get("jti")
    if jti and db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is None:
        db.add(RevokedToken(jti=jti))
    record_event(
        db, "logout", role=claims.get("role"), actor_id=UUID(claims["sub"]), ip_address=get_client_ip(request)
    )
    db.commit()


@router.post("/volunteer/register", response_model=VolunteerOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def volunteer_register(request: Request, payload: VolunteerRegisterIn, db: DbSession):
    if db.query(Volunteer).filter(Volunteer.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    year = datetime.now(timezone.utc).year
    volunteer_id = f"V-{year}-{generate_numeric_id()}"

    volunteer = Volunteer(
        volunteer_id=volunteer_id,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        hashed_password=hash_password(payload.password),
        area=payload.area,
        available_days=payload.available_days,
        motivation=payload.motivation,
    )
    db.add(volunteer)
    notify(db, "admin", "New Volunteer Registration",
           f"{payload.name} registered as a volunteer and is awaiting approval.")
    db.commit()
    db.refresh(volunteer)
    return volunteer
