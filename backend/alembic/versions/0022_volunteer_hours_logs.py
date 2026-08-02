"""volunteer hours tracking: volunteer_hours_logs table

Revision ID: 0022_volunteer_hours_logs
Revises: 0021_donations_razorpay_method
Create Date: 2026-08-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0022_volunteer_hours_logs"
down_revision = "0021_donations_razorpay_method"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "volunteer_hours_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("volunteer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("volunteers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("activity", sa.String(255), nullable=False),
        sa.Column("hours", sa.Numeric(5, 2), nullable=False),
        sa.Column("log_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_volunteer_hours_logs_volunteer_id", "volunteer_hours_logs", ["volunteer_id"])


def downgrade() -> None:
    op.drop_index("ix_volunteer_hours_logs_volunteer_id", table_name="volunteer_hours_logs")
    op.drop_table("volunteer_hours_logs")
