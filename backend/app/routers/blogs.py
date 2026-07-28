from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Request, Response, status

from app.core.limiter import limiter
from app.deps import DbSession
from app.models.blog import BlogArticle
from app.schemas.blog import BlogArticleOut

router = APIRouter(prefix="/blogs", tags=["blogs"])


@router.get("", response_model=list[BlogArticleOut])
@limiter.limit("60/minute")
def list_blogs(
    request: Request,
    response: Response,
    db: DbSession,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    # Public, unauthenticated, and slow-changing -- see hospitals.py for
    # why this is safe to cache unlike everything else (main.py's default).
    response.headers["Cache-Control"] = "public, max-age=60"
    return db.query(BlogArticle).order_by(BlogArticle.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{blog_id}", response_model=BlogArticleOut)
@limiter.limit("60/minute")
def get_blog(request: Request, response: Response, blog_id: UUID, db: DbSession):
    blog = db.query(BlogArticle).filter(BlogArticle.id == blog_id).first()
    if blog is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Blog article not found")
    response.headers["Cache-Control"] = "public, max-age=60"
    return blog
