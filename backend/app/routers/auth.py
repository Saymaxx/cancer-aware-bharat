import random
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status

from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.deps import DbSession
from app.models.hospital import Hospital
from app.models.user import User
from app.models.volunteer import Volunteer
from app.schemas.auth import LoginIn, TokenOut
from app.schemas.volunteer import VolunteerOut, VolunteerRegisterIn

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/staff/login", response_model=TokenOut)
@limiter.limit("10/minute")
def staff_login(request: Request, payload: LoginIn, db: DbSession):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    token = create_access_token(subject=str(user.id), role=user.role)
    return TokenOut(access_token=token, role=user.role, name=user.name)


@router.post("/hospital/login", response_model=TokenOut)
@limiter.limit("10/minute")
def hospital_login(request: Request, payload: LoginIn, db: DbSession):
    hospital = db.query(Hospital).filter(Hospital.login_email == payload.email).first()
    if not hospital or not hospital.hashed_password or not verify_password(payload.password, hospital.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not hospital.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Hospital account is not active")
    token = create_access_token(subject=str(hospital.id), role="hospital")
    return TokenOut(access_token=token, role="hospital", name=hospital.name)


@router.post("/volunteer/login", response_model=TokenOut)
@limiter.limit("10/minute")
def volunteer_login(request: Request, payload: LoginIn, db: DbSession):
    volunteer = db.query(Volunteer).filter(Volunteer.email == payload.email).first()
    if not volunteer or not verify_password(payload.password, volunteer.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    token = create_access_token(subject=str(volunteer.id), role="volunteer")
    return TokenOut(access_token=token, role="volunteer", name=volunteer.name)


@router.post("/volunteer/register", response_model=VolunteerOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def volunteer_register(request: Request, payload: VolunteerRegisterIn, db: DbSession):
    if db.query(Volunteer).filter(Volunteer.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    year = datetime.now(timezone.utc).year
    volunteer_id = f"V-{year}-{random.randint(10000, 99999)}"

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
    db.commit()
    db.refresh(volunteer)
    return volunteer
