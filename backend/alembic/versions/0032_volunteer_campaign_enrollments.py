"""volunteer campaign enrollment + check-in: volunteer_campaign_enrollments table

Revision ID: 0032_campaign_enrollments
Revises: 0031_hospital_info_requested
Create Date: 2026-08-04

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0032_campaign_enrollments"
down_revision = "0031_hospital_info_requested"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "volunteer_campaign_enrollments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("volunteer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("enrolled_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("checked_in_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("volunteer_id", "event_id", name="uq_volunteer_campaign_enrollments_volunteer_event"),
    )
    op.create_index("ix_volunteer_campaign_enrollments_volunteer_id", "volunteer_campaign_enrollments", ["volunteer_id"])
    op.create_index("ix_volunteer_campaign_enrollments_event_id", "volunteer_campaign_enrollments", ["event_id"])


def downgrade() -> None:
    op.drop_index("ix_volunteer_campaign_enrollments_event_id", table_name="volunteer_campaign_enrollments")
    op.drop_index("ix_volunteer_campaign_enrollments_volunteer_id", table_name="volunteer_campaign_enrollments")
    op.drop_table("volunteer_campaign_enrollments")
