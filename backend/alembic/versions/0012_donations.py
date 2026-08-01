"""phase F: donations (Donations Audit)

Revision ID: 0012_donations
Revises: 0011_patient_records
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0012_donations"
down_revision = "0011_patient_records"
branch_labels = None
depends_on = None

DONOR_TYPES = ("Individual", "Corporate", "Foundation", "NGO")
PAYMENT_METHODS = ("UPI", "Net Banking", "Card", "Cheque")


def upgrade() -> None:
    op.create_table(
        "donations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("donor_name", sa.String(200), nullable=False),
        sa.Column("donor_type", sa.String(20), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(20), nullable=False),
        sa.Column("receipt_sent", sa.Boolean(), nullable=False),
        sa.Column("sponsorship_campaign", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint(
            "donor_type IN ('" + "', '".join(DONOR_TYPES) + "')",
            name="ck_donations_donor_type",
        ),
        sa.CheckConstraint(
            "payment_method IN ('" + "', '".join(PAYMENT_METHODS) + "')",
            name="ck_donations_payment_method",
        ),
    )


def downgrade() -> None:
    op.drop_table("donations")
