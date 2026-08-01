import re
import secrets
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import hash_password
from app.deps import DbSession, require_admin_or_superadmin, require_roles
from app.models.hospital import Hospital, HospitalPartnerRequest
from app.models.user import User
from app.schemas.hospital import (
    HospitalApprovalResult,
    HospitalApproveIn,
    HospitalOut,
    HospitalPartnerRequestIn,
    HospitalPartnerRequestOut,
    HospitalRecommendIn,
    HospitalRejectIn,
)
from app.services.audit import record_event
from app.services.notifications import notify

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


def _staff_name(db: Session, claims: dict) -> str:
    user = db.query(User).filter(User.id == UUID(claims["sub"])).first()
    return user.name if user else "Staff"


def _generate_unique_login_email(db: Session, hospital_name: str) -> str:
    slug = re.sub(r"[^a-z0-9]", "", hospital_name.lower())[:20] or "hospital"
    candidate = f"{slug}@awarebharat.org"
    suffix = 1
    while db.query(Hospital).filter(Hospital.login_email == candidate).first() is not None:
        suffix += 1
        candidate = f"{slug}{suffix}@awarebharat.org"
    return candidate


def _generate_temp_password() -> str:
    return "CAB-" + secrets.token_hex(4).upper() + "-TEMP"


@router.get("", response_model=list[HospitalOut])
@limiter.limit("60/minute")
def list_hospitals(
    request: Request,
    response: Response,
    db: DbSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    """Public directory - powers the frontend hospital map/list."""
    # Public, unauthenticated, and slow-changing -- safe to let a browser or
    # CDN cache briefly, unlike every other response (see main.py's
    # no-store default).
    response.headers["Cache-Control"] = "public, max-age=60"
    return (
        db.query(Hospital)
        .filter(Hospital.is_active.is_(True))
        .order_by(Hospital.name)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{hospital_id}", response_model=HospitalOut)
@limiter.limit("60/minute")
def get_hospital(request: Request, response: Response, hospital_id: UUID, db: DbSession):
    # Matches list_hospitals' filter: a deactivated hospital shouldn't be
    # individually fetchable by a public/unauthenticated caller either.
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id, Hospital.is_active.is_(True)).first()
    if hospital is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hospital not found")
    response.headers["Cache-Control"] = "public, max-age=60"
    return hospital


@router.post("/partner-requests", response_model=HospitalPartnerRequestOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def submit_partner_request(request: Request, payload: HospitalPartnerRequestIn, db: DbSession):
    """Public - a hospital applying to join the network (JoinUsTab / HospitalAuthPage register flow)."""
    partner_request = HospitalPartnerRequest(**payload.model_dump())
    db.add(partner_request)
    db.commit()
    db.refresh(partner_request)
    return partner_request


@router.get("/partner-requests/all", response_model=list[HospitalPartnerRequestOut])
@limiter.limit("60/minute")
def list_partner_requests(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("admin", "superadmin"))],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(HospitalPartnerRequest)
        .order_by(HospitalPartnerRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def _get_partner_request_or_404(db: Session, request_id: UUID) -> HospitalPartnerRequest:
    partner_request = db.query(HospitalPartnerRequest).filter(HospitalPartnerRequest.id == request_id).first()
    if partner_request is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Partner request not found")
    return partner_request


@router.post("/partner-requests/{request_id}/recommend", response_model=HospitalPartnerRequestOut)
@limiter.limit("30/minute")
def recommend_partner_request(
    request: Request,
    request_id: UUID,
    payload: HospitalRecommendIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    """Lightweight status flip only -- matches the existing two-stage UI
    intent (Admin recommends, Super Admin gives the final approve/reject).
    No Hospital row is created at this stage."""
    partner_request = _get_partner_request_or_404(db, request_id)
    if partner_request.status != "Pending":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot recommend a request that is currently '{partner_request.status}'",
        )
    partner_request.status = "Recommended"
    if payload.notes:
        partner_request.decision_notes = payload.notes

    notify(db, "superadmin", "Hospital Recommended for Approval",
           f"{_staff_name(db, claims)} recommended {partner_request.hospital_name} for hospital partnership approval.")
    record_event(db, "hospital_recommended", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=partner_request.hospital_name)

    db.commit()
    db.refresh(partner_request)
    return partner_request


@router.post("/partner-requests/{request_id}/approve", response_model=HospitalApprovalResult)
@limiter.limit("15/minute")
def approve_partner_request(
    request: Request,
    request_id: UUID,
    payload: HospitalApproveIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    """Creates the real, login-capable Hospital row -- HospitalPartnerRequest
    has no hospital_id/relationship to one, so approval always creates a
    fresh row rather than activating an existing one. The generated login
    email/temp password are returned once in the response body for the
    approving admin to relay manually; never stored in plaintext, never
    logged (see HospitalApprovalResult)."""
    partner_request = _get_partner_request_or_404(db, request_id)
    if partner_request.status not in ("Pending", "Recommended"):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot approve a request that is currently '{partner_request.status}'",
        )

    login_email = _generate_unique_login_email(db, partner_request.hospital_name)
    temp_password = _generate_temp_password()
    specialties = [s.strip() for s in (partner_request.specialties or "").split(",") if s.strip()]

    hospital = Hospital(
        name=partner_request.hospital_name,
        type=payload.type,
        region=payload.region,
        city=partner_request.city,
        state=payload.state,
        specialties=specialties,
        phone=partner_request.phone,
        email=partner_request.email,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        login_email=login_email,
        hashed_password=hash_password(temp_password),
        is_active=True,
    )
    db.add(hospital)

    partner_request.status = "Approved"
    if payload.notes:
        partner_request.decision_notes = payload.notes

    notify(db, "admin", "Hospital Partner Approved",
           f"{_staff_name(db, claims)} approved {partner_request.hospital_name} -- now a live partner hospital.")
    record_event(db, "hospital_approved", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=partner_request.hospital_name)

    db.commit()
    db.refresh(hospital)
    # Explicit model_validate rather than passing the ORM object straight
    # into the constructor -- HospitalApprovalResult isn't itself returned
    # via response_model's automatic ORM coercion (it's built by hand here),
    # so this makes the from_attributes conversion happen for certain
    # instead of relying on it implicitly.
    return HospitalApprovalResult(
        hospital=HospitalOut.model_validate(hospital),
        login_email=login_email,
        temp_password=temp_password,
    )


@router.post("/partner-requests/{request_id}/reject", response_model=HospitalPartnerRequestOut)
@limiter.limit("30/minute")
def reject_partner_request(
    request: Request,
    request_id: UUID,
    payload: HospitalRejectIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    """Admin-or-superadmin, unlike approve: rejecting creates no Hospital
    row and grants no access, so it doesn't need the same elevated trust as
    approval does -- an Admin can decline a clearly-unsuitable application
    immediately rather than waiting on Super Admin for every rejection."""
    partner_request = _get_partner_request_or_404(db, request_id)
    if partner_request.status not in ("Pending", "Recommended"):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot reject a request that is currently '{partner_request.status}'",
        )
    partner_request.status = "Rejected"
    partner_request.decision_notes = payload.reason

    notify(db, "superadmin", "Hospital Partner Rejected",
           f'{_staff_name(db, claims)} rejected {partner_request.hospital_name}\'s partner application. Reason: "{payload.reason}"')
    record_event(db, "hospital_rejected", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=partner_request.hospital_name)

    db.commit()
    db.refresh(partner_request)
    return partner_request
