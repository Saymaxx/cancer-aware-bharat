"""volunteer training progress: volunteer_training_progress table

Revision ID: 0033_training_progress
Revises: 0032_campaign_enrollments
Create Date: 2026-08-04

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0033_training_progress"
down_revision = "0032_campaign_enrollments"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "volunteer_training_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("volunteer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resource_id", sa.String(50), nullable=False),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("volunteer_id", "resource_id", name="uq_volunteer_training_progress_volunteer_resource"),
    )
    op.create_index("ix_volunteer_training_progress_volunteer_id", "volunteer_training_progress", ["volunteer_id"])


def downgrade() -> None:
    op.drop_index("ix_volunteer_training_progress_volunteer_id", table_name="volunteer_training_progress")
    op.drop_table("volunteer_training_progress")
