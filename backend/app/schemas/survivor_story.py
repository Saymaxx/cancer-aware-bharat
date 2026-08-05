from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel


class SurvivorStorySubmitIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    story_title: str = Field(min_length=1, max_length=255)
    cancer_type: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=10000)
    inspiration: str | None = Field(default=None, max_length=2000)
    email: EmailStr


class SurvivorStoryRejectIn(CamelModel):
    reason: str | None = Field(default=None, max_length=2000)


class SurvivorStoryOut(CamelModel):
    id: UUID
    name: str
    story_title: str
    cancer_type: str
    content: str
    inspiration: str | None = None
    email: str
    status: str
    rejection_reason: str | None = None
    blog_article_id: UUID | None = None
    created_at: datetime
    reviewed_at: datetime | None = None
