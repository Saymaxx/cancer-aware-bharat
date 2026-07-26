import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Volunteer(Base):
    __tablename__ = "volunteers"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)  # e.g. V-2026-12345
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    area: Mapped[str | None] = mapped_column(String(200))
    available_days: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    motivation: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
