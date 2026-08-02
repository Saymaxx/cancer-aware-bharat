import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.custom_role import CustomRole

STAFF_ROLES = ("admin", "superadmin")


class User(Base):
    """Staff accounts: Admin and Super Admin."""

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("role IN ('" + "', '".join(STAFF_ROLES) + "')", name="ck_users_role"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # see STAFF_ROLES
    phone: Mapped[str | None] = mapped_column(String(30))
    region: Mapped[str | None] = mapped_column(String(120))
    # Suspending an admin flips this rather than deleting the row -- matches
    # Hospital.is_active's exact rationale (see hospitals.py login check).
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    # Display/roster label only -- see CustomRole's docstring. SET NULL on
    # delete so removing a role doesn't take the admin row down with it.
    custom_role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("custom_roles.id", ondelete="SET NULL"), nullable=True
    )
    custom_role: Mapped["CustomRole | None"] = relationship(lazy="joined")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    @property
    def custom_role_name(self) -> str | None:
        return self.custom_role.name if self.custom_role else None
