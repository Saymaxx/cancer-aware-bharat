from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.deps import DbSession, require_admin_or_superadmin
from app.models.blog import BlogArticle
from app.schemas.blog import BlogArticleIn, BlogArticleOut
from app.services.audit import record_event

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


@router.post("", response_model=BlogArticleOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_blog(
    request: Request,
    payload: BlogArticleIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    blog = BlogArticle(**payload.model_dump())
    db.add(blog)
    record_event(db, "blog_published", role=claims["role"], actor_id=UUID(claims["sub"]), detail=blog.title)
    db.commit()
    db.refresh(blog)
    return blog


def _get_blog_or_404(db: Session, blog_id: UUID) -> BlogArticle:
    blog = db.query(BlogArticle).filter(BlogArticle.id == blog_id).first()
    if blog is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Blog article not found")
    return blog


@router.patch("/{blog_id}", response_model=BlogArticleOut)
@limiter.limit("30/minute")
def update_blog(
    request: Request,
    blog_id: UUID,
    payload: BlogArticleIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    blog = _get_blog_or_404(db, blog_id)
    for field, value in payload.model_dump().items():
        setattr(blog, field, value)
    record_event(db, "blog_updated", role=claims["role"], actor_id=UUID(claims["sub"]), detail=blog.title)
    db.commit()
    db.refresh(blog)
    return blog


@router.delete("/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_blog(
    request: Request,
    blog_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_admin_or_superadmin)],
):
    blog = _get_blog_or_404(db, blog_id)
    record_event(db, "blog_deleted", role=claims["role"], actor_id=UUID(claims["sub"]), detail=blog.title)
    db.delete(blog)
    db.commit()
