from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.hospital import Hospital, HospitalPartnerRequest
from app.schemas.hospital import HospitalOut, HospitalPartnerRequestIn, HospitalPartnerRequestOut

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get("", response_model=list[HospitalOut])
def list_hospitals(
    db: DbSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    """Public directory - powers the frontend hospital map/list."""
    return (
        db.query(Hospital)
        .filter(Hospital.is_active.is_(True))
        .order_by(Hospital.name)
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/{hospital_id}", response_model=HospitalOut)
def get_hospital(hospital_id: UUID, db: DbSession):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if hospital is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hospital not found")
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
def list_partner_requests(
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
