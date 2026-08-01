from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class BlogArticleOut(CamelModel):
    id: UUID
    title: str
    summary: str = ""
    content: str
    author: str
    role: str | None = None
    date: str
    read_time: str | None = None
    category: str
    image: str | None = None
    tags: list[str] = []


# category/type are plain strings, not a Literal -- pre-existing rows (and
# the admin form's curated category list) don't exhaust every value this
# could reasonably hold, and there's no DB CHECK constraint backing it.
class BlogArticleIn(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    summary: str = Field(default="", max_length=2000)
    content: str = Field(min_length=1)
    author: str = Field(min_length=1, max_length=200)
    role: str | None = Field(default=None, max_length=200)
    date: str = Field(min_length=1, max_length=50)
    read_time: str | None = Field(default=None, max_length=30)
    category: str = Field(min_length=1, max_length=50)
    image: str | None = Field(default=None, max_length=500)
    tags: list[str] = []
