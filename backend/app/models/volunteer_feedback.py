import uuid
from datetime import datetime

from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

FEEDBACK_STATUSES = ("New", "Reviewed", "Responded")


class VolunteerFeedback(Base):
    """Feedback a volunteer left about a campaign. Volunteers submit their own
    via POST /volunteer-feedback/mine (self-service, volunteer_id/volunteer_name
    derived from the token); admins can also log feedback on a volunteer's
    behalf via POST /volunteer-feedback."""

    __tablename__ = "volunteer_feedback"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"), index=True)
    # Denormalized snapshot, matching PatientRecord.hospital_name's rationale.
    volunteer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    # No real Campaign model exists yet for this to FK against -- freeform,
    # same as the mock data it replaces.
    campaign_name: Mapped[str] = mapped_column(String(255), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="New")
    response: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
