import uuid
from datetime import datetime

from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    target_role: Mapped[str] = mapped_column(String(20), nullable=False)  # admin/superadmin/hospital/patient/volunteer
    target_hospital_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("hospitals.id"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    enquiry_id: Mapped[str | None] = mapped_column(String(50))
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
