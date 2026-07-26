from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app.deps import DbSession
from app.models.blog import BlogArticle
from app.schemas.blog import BlogArticleOut

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.get("", response_model=list[BlogArticleOut])
def list_blogs(db: DbSession):
    return db.query(BlogArticle).order_by(BlogArticle.created_at.desc()).all()


@router.get("/{blog_id}", response_model=BlogArticleOut)
def get_blog(blog_id: UUID, db: DbSession):
    blog = db.query(BlogArticle).filter(BlogArticle.id == blog_id).first()
    if blog is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Blog article not found")
    return blog
