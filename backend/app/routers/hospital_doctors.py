from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, current_hospital_id
from app.models.hospital_doctor import HospitalDoctor
from app.models.patient_record import PatientRecord
from app.schemas.hospital_doctor import HospitalDoctorIn, HospitalDoctorOut, HospitalDoctorPatch

router = APIRouter(prefix="/hospital-doctors", tags=["hospital-doctors"])


def _out(db: Session, doctor: HospitalDoctor) -> HospitalDoctorOut:
    count = db.query(PatientRecord).filter(PatientRecord.assigned_doctor_id == doctor.id).count()
    return HospitalDoctorOut.model_validate(doctor).model_copy(update={"assigned_patients_count": count})


def _get_own_doctor_or_404(db: Session, hospital_id: UUID, doctor_id: UUID) -> HospitalDoctor:
    doctor = (
        db.query(HospitalDoctor)
        .filter(HospitalDoctor.id == doctor_id, HospitalDoctor.hospital_id == hospital_id)
        .first()
    )
    if doctor is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Doctor not found")
    return doctor


@router.get("/mine", response_model=list[HospitalDoctorOut])
@limiter.limit("60/minute")
def list_my_doctors(
    request: Request,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    doctors = (
        db.query(HospitalDoctor)
        .filter(HospitalDoctor.hospital_id == hospital_id)
        .order_by(HospitalDoctor.name)
        .all()
    )
    return [_out(db, d) for d in doctors]


@router.post("/mine", response_model=HospitalDoctorOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def add_my_doctor(
    request: Request,
    payload: HospitalDoctorIn,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    doctor = HospitalDoctor(hospital_id=hospital_id, **payload.model_dump())
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return _out(db, doctor)


@router.patch("/mine/{doctor_id}", response_model=HospitalDoctorOut)
@limiter.limit("30/minute")
def update_my_doctor_availability(
    request: Request,
    doctor_id: UUID,
    payload: HospitalDoctorPatch,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    doctor = _get_own_doctor_or_404(db, hospital_id, doctor_id)
    doctor.availability = payload.availability
    db.commit()
    db.refresh(doctor)
    return _out(db, doctor)


@router.delete("/mine/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def remove_my_doctor(
    request: Request,
    doctor_id: UUID,
    db: DbSession,
    hospital_id: Annotated[UUID, Depends(current_hospital_id)],
):
    doctor = _get_own_doctor_or_404(db, hospital_id, doctor_id)
    db.delete(doctor)
    db.commit()
