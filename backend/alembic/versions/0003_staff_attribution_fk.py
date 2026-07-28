"""phase 2: staff attribution FK columns

Revision ID: 0003_staff_attribution_fk
Revises: 0002_phase1_hardening
Create Date: 2026-07-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003_staff_attribution_fk"
down_revision = "0002_phase1_hardening"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Nullable and additive: existing rows predate these columns and simply
    # have no traceable staff id, same as they had no id at all before.
    # The free-text admin_decided_by/super_admin_assigned_by columns are
    # untouched -- these are purely a way to resolve "who exactly" when two
    # staff share a display name (User.name has no uniqueness constraint).
    op.add_column(
        "patient_enquiries",
        sa.Column("admin_decided_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )
    op.add_column(
        "patient_enquiries",
        sa.Column("super_admin_assigned_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("patient_enquiries", "super_admin_assigned_by_id")
    op.drop_column("patient_enquiries", "admin_decided_by_id")
