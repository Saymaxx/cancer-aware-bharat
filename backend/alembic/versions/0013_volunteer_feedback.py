"""phase G: volunteer feedback

Revision ID: 0013_volunteer_feedback
Revises: 0012_donations
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0013_volunteer_feedback"
down_revision = "0012_donations"
branch_labels = None
depends_on = None

FEEDBACK_STATUSES = ("New", "Reviewed", "Responded")


def upgrade() -> None:
    op.create_table(
        "volunteer_feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("volunteer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("volunteers.id"), nullable=True),
        sa.Column("volunteer_name", sa.String(200), nullable=False),
        sa.Column("campaign_name", sa.String(255), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("response", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint(
            "status IN ('" + "', '".join(FEEDBACK_STATUSES) + "')",
            name="ck_volunteer_feedback_status",
        ),
    )
    op.create_index("ix_volunteer_feedback_volunteer_id", "volunteer_feedback", ["volunteer_id"])


def downgrade() -> None:
    op.drop_index("ix_volunteer_feedback_volunteer_id", table_name="volunteer_feedback")
    op.drop_table("volunteer_feedback")
