from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin
from app.models.campaign_request import CampaignRequest
from app.schemas.campaign_request import CampaignRequestIn, CampaignRequestOut
from app.services.audit import record_event

router = APIRouter(prefix="/campaign-requests", tags=["campaign-requests"])


@router.get("", response_model=list[CampaignRequestOut])
@limiter.limit("60/minute")
def list_campaign_requests(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(CampaignRequest)
        .order_by(CampaignRequest.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=CampaignRequestOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_campaign_request(
    request: Request,
    payload: CampaignRequestIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    campaign_request = CampaignRequest(**payload.model_dump(), status="Pending Scheduling")
    db.add(campaign_request)
    db.commit()
    db.refresh(campaign_request)
    return campaign_request


def _get_campaign_request_or_404(db: Session, request_id: UUID) -> CampaignRequest:
    campaign_request = db.query(CampaignRequest).filter(CampaignRequest.id == request_id).first()
    if campaign_request is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Campaign request not found")
    return campaign_request


@router.post("/{request_id}/schedule", response_model=CampaignRequestOut)
@limiter.limit("30/minute")
def schedule_campaign_request(
    request: Request,
    request_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    """Marks a request Scheduled. The frontend creates the actual Event via
    POST /events first, then calls this -- kept as two calls rather than one
    combined endpoint since the event's type/time/category/capacity aren't
    on the request and have to come from the admin's Campaigns Scheduler
    form, not this action."""
    campaign_request = _get_campaign_request_or_404(db, request_id)
    if campaign_request.status != "Pending Scheduling":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot schedule a request that is currently '{campaign_request.status}'",
        )
    campaign_request.status = "Scheduled"
    record_event(db, "campaign_request_scheduled", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=campaign_request.organization_name)
    db.commit()
    db.refresh(campaign_request)
    return campaign_request


@router.post("/{request_id}/decline", response_model=CampaignRequestOut)
@limiter.limit("30/minute")
def decline_campaign_request(
    request: Request,
    request_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    campaign_request = _get_campaign_request_or_404(db, request_id)
    if campaign_request.status != "Pending Scheduling":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"Cannot decline a request that is currently '{campaign_request.status}'",
        )
    campaign_request.status = "Declined"
    record_event(db, "campaign_request_declined", role=claims["role"], actor_id=UUID(claims["sub"]),
                 detail=campaign_request.organization_name)
    db.commit()
    db.refresh(campaign_request)
    return campaign_request
