import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

ENROLLMENT_STATUSES = ("Pending", "Approved", "Rejected")


class VolunteerCampaignEnrollment(Base):
    """A volunteer's request to join a scheduled Event. Requests start
    Pending and require Admin/SuperAdmin approval before the volunteer is
    actually enrolled -- check-in is only possible once status is Approved."""

    __tablename__ = "volunteer_campaign_enrollments"
    __table_args__ = (
        UniqueConstraint("volunteer_id", "event_id", name="uq_volunteer_campaign_enrollments_volunteer_event"),
        CheckConstraint(
            "status IN ('" + "', '".join(ENROLLMENT_STATUSES) + "')",
            name="ck_volunteer_campaign_enrollments_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending")
    # Freeform remarks from whichever action (approve/reject) most recently
    # touched this request -- mirrors the hospital partner request pattern.
    decision_notes: Mapped[str | None] = mapped_column(Text)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    event = relationship("Event", lazy="joined")
    volunteer = relationship("Volunteer", lazy="joined")
