"""survivor story submissions

Revision ID: 0036_survivor_story_submissions
Revises: 0035_enrollment_approval
Create Date: 2026-08-05

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0036_survivor_story_submissions"
down_revision = "0035_enrollment_approval"
branch_labels = None
depends_on = None

SURVIVOR_STORY_STATUSES = ("Pending", "Approved", "Rejected")


def upgrade() -> None:
    op.create_table(
        "survivor_story_submissions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("story_title", sa.String(255), nullable=False),
        sa.Column("cancer_type", sa.String(100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("inspiration", sa.Text(), nullable=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("blog_article_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("blog_articles.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('" + "', '".join(SURVIVOR_STORY_STATUSES) + "')",
            name="ck_survivor_story_submissions_status",
        ),
    )
    op.create_index("ix_survivor_story_submissions_status", "survivor_story_submissions", ["status"])


def downgrade() -> None:
    op.drop_index("ix_survivor_story_submissions_status", table_name="survivor_story_submissions")
    op.drop_table("survivor_story_submissions")
