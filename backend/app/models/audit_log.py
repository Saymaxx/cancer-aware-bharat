import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AuditLog(Base):
    """Generic security/account event log -- login attempts (success and
    failure) and logout, independent of the per-enquiry TimelineEvent audit
    trail (which only covers the patient workflow, not account activity).

    `actor_id` is nullable because a failed login never resolves to a real
    account; `detail` carries the attempted email in that case so a pattern
    of failures against one address is still traceable.
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    role: Mapped[str | None] = mapped_column(String(20), nullable=True)
    actor_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True, index=True)
    detail: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
