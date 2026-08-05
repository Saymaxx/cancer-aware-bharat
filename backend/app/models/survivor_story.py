import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

SURVIVOR_STORY_STATUSES = ("Pending", "Approved", "Rejected")


class SurvivorStorySubmission(Base):
    """A public 'Share Your Story' submission from BlogsTab.tsx. Starts
    Pending; an admin/superadmin either approves it (publishing it as a
    BlogArticle with category='Survivors', linked via blog_article_id) or
    rejects it with an optional reason. Never auto-published -- these are
    unverified public submissions."""

    __tablename__ = "survivor_story_submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    story_title: Mapped[str] = mapped_column(String(255), nullable=False)
    cancer_type: Mapped[str] = mapped_column(String(100), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    inspiration: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Pending", index=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text)
    blog_article_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("blog_articles.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
