"""phase N1: hospital doctors (Hospital Dashboard)

Revision ID: 0024_hospital_doctors
Revises: 0023_reconcile_migration_drift
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0024_hospital_doctors"
down_revision = "0023_reconcile_migration_drift"
branch_labels = None
depends_on = None

AVAILABILITY_STATUSES = ("Available", "In Surgery", "On Leave")


def upgrade() -> None:
    op.create_table(
        "hospital_doctors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("specialty", sa.String(200), nullable=False),
        sa.Column("qualification", sa.String(200), nullable=False),
        sa.Column("experience_years", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("phone", sa.String(30), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("availability", sa.String(20), nullable=False, server_default="Available"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "availability IN ('" + "', '".join(AVAILABILITY_STATUSES) + "')",
            name="ck_hospital_doctors_availability",
        ),
    )
    op.create_index("ix_hospital_doctors_hospital_id", "hospital_doctors", ["hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_hospital_doctors_hospital_id", table_name="hospital_doctors")
    op.drop_table("hospital_doctors")
