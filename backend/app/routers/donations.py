import logging
from typing import Annotated
from uuid import UUID

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status

from app.core.config import settings
from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin
from app.models.donation import Donation
from app.schemas.donation import DonationCheckoutIn, DonationCheckoutOut, DonationIn, DonationOut, DonationVerifyIn
from app.services.audit import record_event

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/donations", tags=["donations"])


def _razorpay_client() -> razorpay.Client:
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


@router.post("/checkout", response_model=DonationCheckoutOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("15/minute")
def create_checkout(
    request: Request,
    payload: DonationCheckoutIn,
    db: DbSession,
):
    """Public -- anyone can start a donation checkout, no login required.
    Only creates a Razorpay Order; no Donation row exists yet (that happens
    in /verify once payment is actually captured and its signature checked)."""
    if not settings.payment_gateway_configured:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Online donations aren't set up yet -- please contact us directly.")

    amount_paise = int(round(payload.amount * 100))
    try:
        order = _razorpay_client().order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
        })
    except Exception:
        logger.exception("Razorpay order creation failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not start checkout with the payment gateway. Please try again shortly.")

    return DonationCheckoutOut(
        order_id=order["id"],
        amount_paise=amount_paise,
        currency="INR",
        key_id=settings.razorpay_key_id,
    )


@router.post("/verify", response_model=DonationOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("15/minute")
def verify_checkout(
    request: Request,
    payload: DonationVerifyIn,
    db: DbSession,
):
    """Public -- completes a checkout started via /checkout. Verifies
    Razorpay's signature server-side before ever recording a real Donation
    row; a client retry after a network hiccup is idempotent (matched on
    razorpay_payment_id) rather than double-recording the same payment."""
    if not settings.payment_gateway_configured:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Online donations aren't set up yet -- please contact us directly.")

    existing = db.query(Donation).filter(Donation.razorpay_payment_id == payload.razorpay_payment_id).first()
    if existing is not None:
        return existing

    try:
        _razorpay_client().utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Payment verification failed -- this payment was not recorded.")

    donation = Donation(
        donor_name=payload.donor_name,
        donor_type=payload.donor_type,
        donor_email=payload.donor_email,
        donor_phone=payload.donor_phone,
        amount=payload.amount,
        payment_method="Razorpay",
        sponsorship_campaign=payload.sponsorship_campaign,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
    )
    db.add(donation)
    record_event(db, "donation_recorded_online", detail=f"{donation.donor_name}: ₹{donation.amount} (Razorpay)")
    db.commit()
    db.refresh(donation)
    return donation


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
    record_event(db, "donation_recorded", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=f"{donation.donor_name}: ₹{donation.amount}")
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
