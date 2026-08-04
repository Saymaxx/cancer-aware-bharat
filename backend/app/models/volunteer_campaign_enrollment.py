import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class VolunteerCampaignEnrollment(Base):
    """A volunteer's self-enrollment in a scheduled Event. Enrolling is
    immediate (no organizer approval step exists), so there's no separate
    "status" column -- checked_in_at being set is what distinguishes
    Confirmed from Checked In on the frontend."""

    __tablename__ = "volunteer_campaign_enrollments"
    __table_args__ = (
        UniqueConstraint("volunteer_id", "event_id", name="uq_volunteer_campaign_enrollments_volunteer_event"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    event = relationship("Event", lazy="joined")
