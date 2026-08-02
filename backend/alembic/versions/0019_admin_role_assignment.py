"""admin role assignment: users.custom_role_id

Revision ID: 0019_admin_role_assignment
Revises: 0018_org_settings
Create Date: 2026-08-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0019_admin_role_assignment"
down_revision = "0018_org_settings"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("custom_role_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_users_custom_role_id_custom_roles",
        "users", "custom_roles",
        ["custom_role_id"], ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_users_custom_role_id_custom_roles", "users", type_="foreignkey")
    op.drop_column("users", "custom_role_id")
