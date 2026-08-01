"""phase K: custom roles (persistence only, no enforcement)

Revision ID: 0015_custom_roles
Revises: 0014_campaigns_scheduler
Create Date: 2026-08-01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0015_custom_roles"
down_revision = "0014_campaigns_scheduler"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "custom_roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.String(1000), nullable=False),
        sa.Column("permissions", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("is_system", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("custom_roles")
