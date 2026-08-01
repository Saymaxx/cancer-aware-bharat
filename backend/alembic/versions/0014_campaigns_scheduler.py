"""phase I: campaigns scheduler (event status + campaign requests)

Revision ID: 0014_campaigns_scheduler
Revises: 0013_volunteer_feedback
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0014_campaigns_scheduler"
down_revision = "0013_volunteer_feedback"
branch_labels = None
depends_on = None

EVENT_STATUSES = ("Scheduled", "Completed", "Cancelled")
ORG_TYPES = ("School", "College", "NGO", "Corporate", "Village Council")
REQUEST_STATUSES = ("Pending Scheduling", "Scheduled", "Declined")


def upgrade() -> None:
    op.add_column("events", sa.Column("status", sa.String(20), nullable=False, server_default="Scheduled"))
    op.create_check_constraint(
        "ck_events_status",
        "events",
        "status IN ('" + "', '".join(EVENT_STATUSES) + "')",
    )

    op.create_table(
        "campaign_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("organization_name", sa.String(255), nullable=False),
        sa.Column("org_type", sa.String(30), nullable=False),
        sa.Column("contact_person", sa.String(200), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("requested_date", sa.String(50), nullable=False),
        sa.Column("location", sa.String(255), nullable=False),
        sa.Column("expected_attendees", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint(
            "org_type IN ('" + "', '".join(ORG_TYPES) + "')",
            name="ck_campaign_requests_org_type",
        ),
        sa.CheckConstraint(
            "status IN ('" + "', '".join(REQUEST_STATUSES) + "')",
            name="ck_campaign_requests_status",
        ),
    )


def downgrade() -> None:
    op.drop_table("campaign_requests")
    op.drop_constraint("ck_events_status", "events", type_="check")
    op.drop_column("events", "status")
