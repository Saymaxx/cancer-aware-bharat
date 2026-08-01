from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import generate_numeric_id
from app.deps import DbSession, require_admin_or_superadmin
from app.models.patient_record import PatientRecord
from app.schemas.patient_record import PatientRecordIn, PatientRecordOut
from app.services.audit import record_event

router = APIRouter(prefix="/patient-records", tags=["patient-records"])


@router.get("", response_model=list[PatientRecordOut])
@limiter.limit("60/minute")
def list_patient_records(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(PatientRecord)
        .order_by(PatientRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=PatientRecordOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_patient_record(
    request: Request,
    payload: PatientRecordIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    year = datetime.now(timezone.utc).year
    record = PatientRecord(
        record_id=f"CASE-{year}-{generate_numeric_id()}",
        **payload.model_dump(),
    )
    db.add(record)
    record_event(db, "patient_record_created", role=claims["role"], actor_id=UUID(claims["sub"]), detail=record.name)
    db.commit()
    db.refresh(record)
    return record


def _get_patient_record_or_404(db: Session, record_id: UUID) -> PatientRecord:
    record = db.query(PatientRecord).filter(PatientRecord.id == record_id).first()
    if record is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Patient record not found")
    return record


@router.patch("/{record_id}", response_model=PatientRecordOut)
@limiter.limit("30/minute")
def update_patient_record(
    request: Request,
    record_id: UUID,
    payload: PatientRecordIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    record = _get_patient_record_or_404(db, record_id)
    for field, value in payload.model_dump().items():
        setattr(record, field, value)
    record_event(db, "patient_record_updated", role=claims["role"], actor_id=UUID(claims["sub"]), detail=record.name)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_patient_record(
    request: Request,
    record_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    record = _get_patient_record_or_404(db, record_id)
    record_event(db, "patient_record_deleted", role=claims["role"], actor_id=UUID(claims["sub"]), detail=record.name)
    db.delete(record)
    db.commit()
