"""online donations: donor contact + razorpay order/payment ids

Revision ID: 0020_online_donations
Revises: 0019_admin_role_assignment
Create Date: 2026-08-02

"""
from alembic import op
import sqlalchemy as sa

revision = "0020_online_donations"
down_revision = "0019_admin_role_assignment"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("donations", sa.Column("donor_email", sa.String(255), nullable=True))
    op.add_column("donations", sa.Column("donor_phone", sa.String(30), nullable=True))
    op.add_column("donations", sa.Column("razorpay_order_id", sa.String(64), nullable=True))
    op.add_column("donations", sa.Column("razorpay_payment_id", sa.String(64), nullable=True))
    op.create_unique_constraint("uq_donations_razorpay_payment_id", "donations", ["razorpay_payment_id"])


def downgrade() -> None:
    op.drop_constraint("uq_donations_razorpay_payment_id", "donations", type_="unique")
    op.drop_column("donations", "razorpay_payment_id")
    op.drop_column("donations", "razorpay_order_id")
    op.drop_column("donations", "donor_phone")
    op.drop_column("donations", "donor_email")
