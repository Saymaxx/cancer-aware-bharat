"""admin management: is_active/phone/region on users

Revision ID: 0016_admin_management
Revises: 0015_custom_roles
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa

revision = "0016_admin_management"
down_revision = "0015_custom_roles"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("phone", sa.String(30), nullable=True))
    op.add_column("users", sa.Column("region", sa.String(120), nullable=True))
    op.add_column("users", sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade() -> None:
    op.drop_column("users", "is_active")
    op.drop_column("users", "region")
    op.drop_column("users", "phone")
