"""donations: allow 'Razorpay' as a payment_method value

Revision ID: 0021_donations_razorpay_method
Revises: 0020_online_donations
Create Date: 2026-08-02

"""
from alembic import op

revision = "0021_donations_razorpay_method"
down_revision = "0020_online_donations"
branch_labels = None
depends_on = None

OLD_METHODS = ("UPI", "Net Banking", "Card", "Cheque")
NEW_METHODS = ("UPI", "Net Banking", "Card", "Cheque", "Razorpay")


def upgrade() -> None:
    op.drop_constraint("ck_donations_payment_method", "donations", type_="check")
    op.create_check_constraint(
        "ck_donations_payment_method",
        "donations",
        "payment_method IN ('" + "', '".join(NEW_METHODS) + "')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_donations_payment_method", "donations", type_="check")
    op.create_check_constraint(
        "ck_donations_payment_method",
        "donations",
        "payment_method IN ('" + "', '".join(OLD_METHODS) + "')",
    )
