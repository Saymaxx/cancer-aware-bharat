"""phase N2: ngo referrals (Hospital Dashboard)

Revision ID: 0025_ngo_referrals
Revises: 0024_hospital_doctors
Create Date: 2026-08-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0025_ngo_referrals"
down_revision = "0024_hospital_doctors"
branch_labels = None
depends_on = None

PRIORITIES = ("Normal", "Urgent", "Critical")
REFERRAL_STATUSES = ("Pending Action", "Accepted", "Declined")


def upgrade() -> None:
    op.create_table(
        "ngo_referrals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("hospital_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("hospitals.id"), nullable=False),
        sa.Column("patient_name", sa.String(200), nullable=False),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(20), nullable=False),
        sa.Column("referral_date", sa.Date(), nullable=False),
        sa.Column("priority", sa.String(20), nullable=False, server_default="Normal"),
        sa.Column("cancer_type", sa.String(200), nullable=False),
        sa.Column("recommended_department", sa.String(200), nullable=False),
        sa.Column("referred_by_ngo_agent", sa.String(200), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="Pending Action"),
        sa.Column("decline_reason", sa.String(1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "priority IN ('" + "', '".join(PRIORITIES) + "')",
            name="ck_ngo_referrals_priority",
        ),
        sa.CheckConstraint(
            "status IN ('" + "', '".join(REFERRAL_STATUSES) + "')",
            name="ck_ngo_referrals_status",
        ),
    )
    op.create_index("ix_ngo_referrals_hospital_id", "ngo_referrals", ["hospital_id"])


def downgrade() -> None:
    op.drop_index("ix_ngo_referrals_hospital_id", table_name="ngo_referrals")
    op.drop_table("ngo_referrals")
