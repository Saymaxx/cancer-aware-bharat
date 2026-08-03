from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func

from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.donation import Donation
from app.models.enquiry import PatientEnquiry
from app.models.volunteer_hours_log import VolunteerHoursLog
from app.schemas.analytics import MonthlyAmountOut, MonthlyCountOut, MonthlyHoursOut

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/donations-monthly", response_model=list[MonthlyAmountOut])
@limiter.limit("60/minute")
def donations_monthly(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    month = func.to_char(Donation.created_at, "YYYY-MM").label("month")
    rows = (
        db.query(month, func.sum(Donation.amount).label("amount"))
        .group_by(month)
        .order_by(month)
        .all()
    )
    return [MonthlyAmountOut(month=r.month, amount=float(r.amount)) for r in rows]


@router.get("/patient-intake-monthly", response_model=list[MonthlyCountOut])
@limiter.limit("60/minute")
def patient_intake_monthly(
    request: Request,
    db: DbSession,
    # Also used by Admin's own dashboard overview (unlike the other two
    # endpoints here, which stay superadmin-only) -- this is an org-wide
    # aggregate count with no PII, not a privacy concern the way the raw
    # donation ledger or audit log would be.
    claims: Annotated[dict, Depends(require_roles("admin", "superadmin"))],
):
    month = func.to_char(PatientEnquiry.created_at, "YYYY-MM").label("month")
    rows = (
        db.query(month, func.count(PatientEnquiry.id).label("count"))
        .group_by(month)
        .order_by(month)
        .all()
    )
    return [MonthlyCountOut(month=r.month, count=r.count) for r in rows]


@router.get("/volunteer-hours-monthly", response_model=list[MonthlyHoursOut])
@limiter.limit("60/minute")
def volunteer_hours_monthly(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    month = func.to_char(VolunteerHoursLog.log_date, "YYYY-MM").label("month")
    rows = (
        db.query(month, func.sum(VolunteerHoursLog.hours).label("hours"))
        .group_by(month)
        .order_by(month)
        .all()
    )
    return [MonthlyHoursOut(month=r.month, hours=float(r.hours)) for r in rows]
