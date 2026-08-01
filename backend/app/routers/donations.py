from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin
from app.models.donation import Donation
from app.schemas.donation import DonationIn, DonationOut

router = APIRouter(prefix="/donations", tags=["donations"])


@router.get("", response_model=list[DonationOut])
@limiter.limit("60/minute")
def list_donations(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(Donation)
        .order_by(Donation.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_donation(
    request: Request,
    payload: DonationIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    donation = Donation(**payload.model_dump())
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


@router.post("/{donation_id}/send-receipt", response_model=DonationOut)
@limiter.limit("30/minute")
def send_receipt(
    request: Request,
    donation_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    donation = db.query(Donation).filter(Donation.id == donation_id).first()
    if donation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Donation not found")
    if donation.receipt_sent:
        raise HTTPException(status.HTTP_409_CONFLICT, "Receipt already sent")
    donation.receipt_sent = True
    db.commit()
    db.refresh(donation)
    return donation
