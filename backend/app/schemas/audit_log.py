from datetime import datetime
from typing import Literal
from uuid import UUID

from app.schemas.base import CamelModel

Severity = Literal["Info", "Warning", "Critical"]


class AuditLogOut(CamelModel):
    id: UUID
    event_type: str
    role: str | None = None
    actor_id: UUID | None = None
    detail: str | None = None
    ip_address: str | None = None
    severity: Severity
    created_at: datetime
