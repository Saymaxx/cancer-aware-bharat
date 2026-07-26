"""Port of the frontend's enquiryStore.ts state machine to the server side.

Each function performs one workflow transition: it mutates the enquiry,
appends a TimelineEvent, and fires the same Notification fan-out the
frontend mock used to do in localStorage.
"""
import random
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enquiry import AppointmentDetails, PatientEnquiry, TimelineEvent
from app.models.hospital import Hospital
from app.schemas.enquiry import PatientEnquiryCreate
from app.services.notifications import notify

URGENT_KEYWORDS = ("lump", "stage")


def _now_formatted() -> str:
    return datetime.now(timezone.utc).strftime("%d %b %Y, %I:%M %p")


def _get_enquiry_or_404(db: Session, enquiry_id: UUID) -> PatientEnquiry:
    enquiry = db.query(PatientEnquiry).filter(PatientEnquiry.id == enquiry_id).first()
    if enquiry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enquiry not found")
    return enquiry


def submit_enquiry(db: Session, data: PatientEnquiryCreate) -> PatientEnquiry:
    year = datetime.now(timezone.utc).year
    random_num = random.randint(10000, 99999)
    enquiry_id = f"ENQ-{year}-{random_num}"
    reference_number = f"PAT-{year}-{random_num}"

    preferred_hospital_name = None
    if data.preferred_hospital_id:
        hospital = db.query(Hospital).filter(Hospital.id == data.preferred_hospital_id).first()
        if hospital:
            preferred_hospital_name = hospital.name

    priority = data.priority
    if not priority:
        haystack = f"{data.symptoms or ''} {data.notes or ''}".lower()
        priority = "Urgent" if any(k in haystack for k in URGENT_KEYWORDS) else "Normal"

    enquiry = PatientEnquiry(
        enquiry_id=enquiry_id,
        reference_number=reference_number,
        patient_name=data.patient_name,
        age=data.age,
        gender=data.gender,
        phone=data.phone,
        email=data.email,
        address=data.address or data.city,
        city=data.city,
        state=data.state,
        preferred_location=data.preferred_location or data.city,
        reason=data.reason,
        cancer_type=data.cancer_type or data.reason,
        symptoms=data.symptoms or data.notes,
        notes=data.notes,
        hospital_id=data.preferred_hospital_id,
        preferred_hospital_name=preferred_hospital_name,
        preferred_date=data.preferred_date,
        status="Pending Admin Review",
        priority=priority,
        date=datetime.now(timezone.utc).strftime("%d-%m-%Y"),
    )
    db.add(enquiry)
    db.flush()

    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Patient Submitted",
        description=f"Patient {data.patient_name} submitted enquiry form for {data.reason}.",
        actor=f"{data.patient_name} (Patient)",
    ))

    notify(db, "admin", "New Patient Enquiry Received",
           f"Enquiry {enquiry_id} for {data.patient_name} ({data.city}) submitted. Status: Pending Admin Review.",
           enquiry_id=enquiry_id)
    notify(db, "patient", "Enquiry Received",
           f"Your enquiry {enquiry_id} (Ref: {reference_number}) has been submitted and is pending admin review.",
           enquiry_id=enquiry_id)

    db.commit()
    db.refresh(enquiry)
    return enquiry


def admin_approve(db: Session, enquiry_id: UUID, admin_name: str, remarks: str | None) -> PatientEnquiry:
    enquiry = _get_enquiry_or_404(db, enquiry_id)
    now = _now_formatted()
    remarks = remarks or "Approved after document verification."

    enquiry.status = "Approved by Admin"
    enquiry.admin_decided_by = admin_name
    enquiry.admin_decided_at = now
    enquiry.admin_action = "Approve"
    enquiry.admin_remarks = remarks

    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Admin Approved",
        description=f"Enquiry reviewed and approved by Admin ({admin_name}). Forwarded for Super Admin hospital assignment.",
        actor=admin_name,
        remarks=remarks,
    ))
    notify(db, "superadmin", "Enquiry Approved by Admin",
           f"Patient {enquiry.patient_name} ({enquiry.enquiry_id}) approved by Admin {admin_name}. Pending Hospital Assignment.",
           enquiry_id=enquiry.enquiry_id)
    notify(db, "patient", "Enquiry Approved by Admin",
           f"Your enquiry {enquiry.enquiry_id} has been approved and is pending hospital assignment.",
           enquiry_id=enquiry.enquiry_id)

    db.commit()
    db.refresh(enquiry)
    return enquiry


def admin_reject(db: Session, enquiry_id: UUID, admin_name: str, reason: str) -> PatientEnquiry:
    enquiry = _get_enquiry_or_404(db, enquiry_id)
    now = _now_formatted()

    enquiry.status = "Rejected by Admin"
    enquiry.admin_decided_by = admin_name
    enquiry.admin_decided_at = now
    enquiry.admin_action = "Reject"
    enquiry.admin_remarks = reason

    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Admin Rejected",
        description=f"Enquiry rejected by Admin ({admin_name}). Reason: {reason}",
        actor=admin_name,
        remarks=reason,
    ))
    notify(db, "patient", "Enquiry Decision Notice",
           f"Your enquiry {enquiry.enquiry_id} was reviewed. Reason: {reason}. Please contact support for guidance.",
           enquiry_id=enquiry.enquiry_id)

    db.commit()
    db.refresh(enquiry)
    return enquiry


def super_admin_assign_hospital(
    db: Session, enquiry_id: UUID, hospital_id: UUID, super_admin_name: str, remarks: str | None
) -> PatientEnquiry:
    enquiry = _get_enquiry_or_404(db, enquiry_id)
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if hospital is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hospital not found")
    now = _now_formatted()

    enquiry.hospital_id = hospital.id
    enquiry.assigned_hospital_name = hospital.name
    enquiry.status = "Assigned to Hospital"
    enquiry.super_admin_assigned_by = super_admin_name
    enquiry.super_admin_assigned_at = now
    enquiry.super_admin_remarks = remarks or f"Assigned to {hospital.name}"

    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Assigned to Hospital",
        description=f"Patient assigned to {hospital.name} by Super Admin ({super_admin_name}).",
        actor=super_admin_name,
        remarks=remarks or f"Assigned to {hospital.name}",
    ))
    notify(db, "hospital", "New Patient Assigned",
           f"New patient {enquiry.patient_name} ({enquiry.enquiry_id}) assigned to your hospital. Please review and respond.",
           enquiry_id=enquiry.enquiry_id, target_hospital_id=hospital.id)
    notify(db, "patient", "Hospital Assigned",
           f"Your enquiry {enquiry.enquiry_id} has been assigned to {hospital.name}.",
           enquiry_id=enquiry.enquiry_id)

    db.commit()
    db.refresh(enquiry)
    return enquiry


def hospital_accept(
    db: Session,
    enquiry_id: UUID,
    acting_hospital_id: UUID,
    appointment_date: str,
    appointment_time: str,
    doctor_name: str,
    remarks: str | None,
) -> PatientEnquiry:
    enquiry = _get_enquiry_or_404(db, enquiry_id)
    if enquiry.hospital_id != acting_hospital_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This enquiry is not assigned to your hospital")

    hospital_name = enquiry.assigned_hospital_name or "Partner Hospital"
    now = _now_formatted()
    year = datetime.now(timezone.utc).year
    appointment_id = f"APT-{year}-{random.randint(10000, 99999)}"
    remarks = remarks or "Patient accepted for clinical evaluation."

    enquiry.status = "Appointment Confirmed"
    enquiry.hospital_decided_by = hospital_name
    enquiry.hospital_decided_at = now
    enquiry.hospital_action = "Accept"
    enquiry.hospital_remarks = remarks

    db.add(AppointmentDetails(
        appointment_id=appointment_id,
        enquiry_id=enquiry.id,
        hospital_id=acting_hospital_id,
        hospital_name=hospital_name,
        patient_name=enquiry.patient_name,
        date=appointment_date or enquiry.preferred_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        time=appointment_time or "10:30 AM",
        doctor=doctor_name or "Dr. Specialist (Oncology)",
        status="Appointment Confirmed",
    ))

    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Hospital Accepted",
        description=f"Accepted by {hospital_name}. Remarks: {remarks}",
        actor=hospital_name,
        remarks=remarks,
    ))
    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Appointment Created",
        description=f"Appointment ({appointment_id}) confirmed for {appointment_date} at {appointment_time} with {doctor_name}.",
        actor=hospital_name,
    ))

    notify(db, "admin", "Patient Appointment Confirmed",
           f"Hospital {hospital_name} accepted patient {enquiry.patient_name}. Appointment {appointment_id} confirmed.",
           enquiry_id=enquiry.enquiry_id)
    notify(db, "superadmin", "Patient Appointment Confirmed",
           f"Hospital {hospital_name} accepted patient {enquiry.patient_name} ({enquiry.enquiry_id}).",
           enquiry_id=enquiry.enquiry_id)
    notify(db, "hospital", "Appointment Confirmed",
           f"Appointment {appointment_id} generated for {enquiry.patient_name} on {appointment_date} at {appointment_time}.",
           enquiry_id=enquiry.enquiry_id, target_hospital_id=acting_hospital_id)
    notify(db, "patient", "Appointment Confirmed!",
           f"Your appointment ({appointment_id}) at {hospital_name} is confirmed for {appointment_date} at {appointment_time} with {doctor_name}.",
           enquiry_id=enquiry.enquiry_id)

    db.commit()
    db.refresh(enquiry)
    return enquiry


def hospital_decline(db: Session, enquiry_id: UUID, acting_hospital_id: UUID, reason: str) -> PatientEnquiry:
    enquiry = _get_enquiry_or_404(db, enquiry_id)
    if enquiry.hospital_id != acting_hospital_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This enquiry is not assigned to your hospital")

    hospital_name = enquiry.assigned_hospital_name or "Partner Hospital"
    now = _now_formatted()

    enquiry.status = "Declined by Hospital"
    enquiry.hospital_decided_by = hospital_name
    enquiry.hospital_decided_at = now
    enquiry.hospital_action = "Decline"
    enquiry.hospital_remarks = reason

    db.add(TimelineEvent(
        enquiry_id=enquiry.id,
        stage="Hospital Declined",
        description=f"Declined by {hospital_name}. Reason: {reason}. Returned to Super Admin queue for reassignment.",
        actor=hospital_name,
        remarks=reason,
    ))
    notify(db, "superadmin", "Hospital Declined Patient - Reassignment Required",
           f'Hospital {hospital_name} declined patient {enquiry.patient_name} ({enquiry.enquiry_id}). Reason: "{reason}".',
           enquiry_id=enquiry.enquiry_id)

    db.commit()
    db.refresh(enquiry)
    return enquiry
