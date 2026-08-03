"""per-recipient notification read state: notification_reads table

Revision ID: 0030_notification_reads
Revises: 0029_event_hospital_id
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0030_notification_reads"
down_revision = "0029_event_hospital_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "notification_reads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("notification_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("notifications.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("notification_id", "user_id", name="uq_notification_reads_notification_user"),
    )
    op.create_index("ix_notification_reads_notification_id", "notification_reads", ["notification_id"])
    op.create_index("ix_notification_reads_user_id", "notification_reads", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_notification_reads_user_id", table_name="notification_reads")
    op.drop_index("ix_notification_reads_notification_id", table_name="notification_reads")
    op.drop_table("notification_reads")
