import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VolunteerTrainingProgress(Base):
    """A volunteer's completion progress on one training resource. resource_id
    is freeform (matches the frontend's static TRAINING_RESOURCES catalog ids
    like 'res-1') -- there's no backend-owned resource table, same rationale
    as VolunteerFeedback.campaign_name."""

    __tablename__ = "volunteer_training_progress"
    __table_args__ = (
        UniqueConstraint("volunteer_id", "resource_id", name="uq_volunteer_training_progress_volunteer_resource"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    resource_id: Mapped[str] = mapped_column(String(50), nullable=False)
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
