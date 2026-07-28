"""phase 1 hardening: token revocation table + hot-path indexes

Revision ID: 0002_phase1_hardening
Revises: 0001_initial_schema
Create Date: 2026-07-27

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_phase1_hardening"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "revoked_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("jti", sa.String(36), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("jti"),
    )
    op.create_index("ix_revoked_tokens_jti", "revoked_tokens", ["jti"])

    # Both filtered on every dashboard tab load / hospital-scoped request;
    # Postgres does not auto-index foreign key columns.
    op.create_index("ix_patient_enquiries_status", "patient_enquiries", ["status"])
    op.create_index("ix_patient_enquiries_hospital_id", "patient_enquiries", ["hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_patient_enquiries_hospital_id", table_name="patient_enquiries")
    op.drop_index("ix_patient_enquiries_status", table_name="patient_enquiries")
    op.drop_index("ix_revoked_tokens_jti", table_name="revoked_tokens")
    op.drop_table("revoked_tokens")
