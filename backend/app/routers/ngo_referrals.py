from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, current_hospital_id, require_admin_or_superadmin
from app.models.ngo_referral import NgoReferral
from app.schemas.ngo_referral import NgoReferralDeclineIn, NgoReferralIn, NgoReferralOut
from app.services.notifications import notify

router = APIRouter(prefix="/ngo-referrals", tags=["ngo-referrals"])


def _get_own_referral_or_404(db: Session, hospital_id: UUID, referral_id: UUID) -> NgoReferral:
    referral = (
        db.query(NgoReferral)
        .filter(NgoReferral.id == referral_id, NgoReferral.hospital_id == hospital_id)
        .first()
    )
    if referral is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Referral not found")
    return referral


@router.post("", response_model=NgoReferralOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_referral(
    request: Request,
    payload: NgoReferralIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    """Admin/superadmin only -- a CAB caseworker referring a patient to a
    specific partner hospital. The hospital only accepts/declines it."""
    referral = NgoReferral(**payload.model_dump())
    db.add(referral)
    db.commit()
    db.refresh(referral)
    notify(db, "hospital", "New Patient Referral",
           f'{referral.referred_by_ngo_agent} referred "{referral.patient_name}" for {referral.cancer_type} treatment.',
           target_hospital_id=referral.hospital_id)
    return referral


@router.get("/mine", response_model=list[NgoReferralOut])
@limiter.limit("60/minute")
def list_my_referrals(
    request: Request,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    return (
        db.query(NgoReferral)
        .filter(NgoReferral.hospital_id == hospital_id)
        .order_by(NgoReferral.created_at.desc())
        .all()
    )


@router.post("/mine/{referral_id}/accept", response_model=NgoReferralOut)
@limiter.limit("30/minute")
def accept_my_referral(
    request: Request,
    referral_id: UUID,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    referral = _get_own_referral_or_404(db, hospital_id, referral_id)
    if referral.status != "Pending Action":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Cannot accept a referral that is currently '{referral.status}'")
    referral.status = "Accepted"
    db.commit()
    db.refresh(referral)
    return referral


@router.post("/mine/{referral_id}/decline", response_model=NgoReferralOut)
@limiter.limit("30/minute")
def decline_my_referral(
    request: Request,
    referral_id: UUID,
    payload: NgoReferralDeclineIn,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    referral = _get_own_referral_or_404(db, hospital_id, referral_id)
    if referral.status != "Pending Action":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Cannot decline a referral that is currently '{referral.status}'")
    referral.status = "Declined"
    referral.decline_reason = payload.reason
    db.commit()
    db.refresh(referral)
    return referral
