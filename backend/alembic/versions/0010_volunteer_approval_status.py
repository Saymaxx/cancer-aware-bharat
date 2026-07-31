"""phase C: volunteer approval status gate

Revision ID: 0010_volunteer_approval_status
Revises: 0009_partner_request_status
Create Date: 2026-07-31

"""
from alembic import op
import sqlalchemy as sa

revision = "0010_volunteer_approval_status"
down_revision = "0009_partner_request_status"
branch_labels = None
depends_on = None

VOLUNTEER_STATUSES = ("Pending Approval", "Approved", "Rejected")


def upgrade() -> None:
    # Nullable first so the backfill below can target pre-existing rows
    # before NOT NULL is enforced -- every volunteer who registered under
    # the old no-gate system must keep working login access.
    op.add_column("volunteers", sa.Column("status", sa.String(length=30), nullable=True))
    op.execute("UPDATE volunteers SET status = 'Approved' WHERE status IS NULL")
    op.alter_column(
        "volunteers", "status",
        existing_type=sa.String(length=30),
        nullable=False,
        server_default="Pending Approval",
    )
    op.create_check_constraint(
        "ck_volunteers_status",
        "volunteers",
        "status IN ('" + "', '".join(VOLUNTEER_STATUSES) + "')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_volunteers_status", "volunteers", type_="check")
    op.drop_column("volunteers", "status")
