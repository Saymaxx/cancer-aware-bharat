from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func

from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.donation import Donation
from app.models.enquiry import PatientEnquiry
from app.schemas.analytics import MonthlyAmountOut, MonthlyCountOut

router = APIRouter(prefix="/analytics", tags=["analytics"])

# Volunteer hours has no real data source (hoursLogged is a hardcoded 0 on
# every volunteer -- see Phase C) -- deliberately not exposed here rather
# than fabricating a chart for it. Only donations and patient intake have
# real, aggregable columns to chart.


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
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    month = func.to_char(PatientEnquiry.created_at, "YYYY-MM").label("month")
    rows = (
        db.query(month, func.count(PatientEnquiry.id).label("count"))
        .group_by(month)
        .order_by(month)
        .all()
    )
    return [MonthlyCountOut(month=r.month, count=r.count) for r in rows]
