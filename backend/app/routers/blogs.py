from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.deps import DbSession
from app.models.blog import BlogArticle
from app.schemas.blog import BlogArticleOut

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.get("", response_model=list[BlogArticleOut])
def list_blogs(
    db: DbSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return db.query(BlogArticle).order_by(BlogArticle.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{blog_id}", response_model=BlogArticleOut)
def get_blog(blog_id: UUID, db: DbSession):
    blog = db.query(BlogArticle).filter(BlogArticle.id == blog_id).first()
    if blog is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Blog article not found")
    return blog
