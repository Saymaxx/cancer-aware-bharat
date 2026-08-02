import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class VolunteerHoursLog(Base):
    """A volunteer's self-reported hours for a single activity. No Campaign
    model exists to link this against, so activity is freeform text --
    matches VolunteerFeedback.campaign_name's rationale."""

    __tablename__ = "volunteer_hours_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    activity: Mapped[str] = mapped_column(String(255), nullable=False)
    hours: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    log_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
