import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

ISSUE_REPORT_STATUSES = ("New", "Reviewed", "Resolved")


class VolunteerIssueReport(Base):
    """An operational issue a volunteer flags during a campaign (kit
    shortage, venue access, crowd surge, medical escalation) -- the "Report
    Camp Issue / Delay" modal. Volunteers submit their own via
    POST /volunteer-issues/mine; admin/superadmin triage and resolve."""

    __tablename__ = "volunteer_issue_reports"
    __table_args__ = (
        CheckConstraint(
            "status IN ('" + "', '".join(ISSUE_REPORT_STATUSES) + "')",
            name="ck_volunteer_issue_reports_status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False, index=True)
    # Denormalized snapshot, matching VolunteerFeedback.volunteer_name's rationale.
    volunteer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="New")
    resolution_notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
