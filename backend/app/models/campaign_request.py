import uuid
from datetime import datetime

from sqlalchemy import Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

ORG_TYPES = ("School", "College", "NGO", "Corporate", "Village Council")
REQUEST_STATUSES = ("Pending Scheduling", "Scheduled", "Declined")


class CampaignRequest(Base):
    """An organization's request to host a screening/awareness campaign.
    No public submission form exists yet -- these are admin-visible
    entries an admin schedules into a real Event via POST /{id}/schedule,
    same scope decision as VolunteerFeedback."""

    __tablename__ = "campaign_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_name: Mapped[str] = mapped_column(String(255), nullable=False)
    org_type: Mapped[str] = mapped_column(String(30), nullable=False)
    contact_person: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    requested_date: Mapped[str] = mapped_column(String(50), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    expected_attendees: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending Scheduling")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
