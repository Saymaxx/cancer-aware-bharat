from uuid import UUID

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog


def record_event(
    db: Session,
    event_type: str,
    role: str | None = None,
    actor_id: UUID | None = None,
    detail: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        event_type=event_type,
        role=role,
        actor_id=actor_id,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(entry)
    return entry
