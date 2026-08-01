from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request

from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut

router = APIRouter(prefix="/audit-logs", tags=["audit-logs"])

# event_type has no severity column of its own -- derived from the verb
# suffix record_event() call sites already use consistently, so the whole
# real event catalog maps onto the SuperAdmin UI's Info/Warning/Critical
# filter without needing a column migration for it.
_CRITICAL_SUFFIXES = ("_rejected", "_declined", "_deleted", "_suspended")
_WARNING_SUFFIXES = ("_recommended", "_updated")


def _severity_for(event_type: str) -> str:
    if event_type == "login_failure" or event_type.endswith(_CRITICAL_SUFFIXES):
        return "Critical"
    if event_type.endswith(_WARNING_SUFFIXES):
        return "Warning"
    return "Info"


@router.get("", response_model=list[AuditLogOut])
@limiter.limit("60/minute")
def list_audit_logs(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        AuditLogOut(
            id=log.id,
            event_type=log.event_type,
            role=log.role,
            actor_id=log.actor_id,
            detail=log.detail,
            ip_address=log.ip_address,
            severity=_severity_for(log.event_type),
            created_at=log.created_at,
        )
        for log in logs
    ]
