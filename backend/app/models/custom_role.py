import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CustomRole(Base):
    """Persisted role name/description/permission-list only -- per the
    confirmed scope decision, this does NOT enforce anything. Actual access
    control stays exactly what it was before this table existed (the plain
    admin/superadmin claim on the JWT); there's no admin-assignment
    mechanism, so `assigned_count` is never anything but 0 (see RoleOut)."""

    __tablename__ = "custom_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), default="")
    permissions: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
