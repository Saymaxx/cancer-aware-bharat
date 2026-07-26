import uuid
from datetime import datetime

from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BlogArticle(Base):
    __tablename__ = "blog_articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str | None] = mapped_column(String(200))
    date: Mapped[str] = mapped_column(String(50), nullable=False)
    read_time: Mapped[str | None] = mapped_column(String(30))
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    image: Mapped[str | None] = mapped_column(String(500))
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
