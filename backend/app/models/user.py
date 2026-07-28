import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
