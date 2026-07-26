from uuid import UUID

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
