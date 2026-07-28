"""phase 3: generic security/audit event log

Revision ID: 0004_audit_log
Revises: 0003_staff_attribution_fk
Create Date: 2026-07-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0004_audit_log"
down_revision = "0003_staff_attribution_fk"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=True),
        sa.Column("actor_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("detail", sa.String(length=255), nullable=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_audit_logs_event_type", "audit_logs", ["event_type"])
    op.create_index("ix_audit_logs_actor_id", "audit_logs", ["actor_id"])
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_index("ix_audit_logs_actor_id", table_name="audit_logs")
    op.drop_index("ix_audit_logs_event_type", table_name="audit_logs")
    op.drop_table("audit_logs")
