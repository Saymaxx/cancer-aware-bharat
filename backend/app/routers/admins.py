from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.core.security import generate_temp_password, hash_password
from app.deps import DbSession, require_roles
from app.models.user import User
from app.schemas.admin import AdminCreateResult, AdminIn, AdminOut, AdminUpdateIn
from app.services.audit import record_event

router = APIRouter(prefix="/admins", tags=["admins"])

# This manages regional Admin accounts, not other Super Admins -- a Super
# Admin suspending/deleting a peer (or themselves) via this list isn't a
# scenario this UI is meant to support, so the list and every action below
# scope strictly to role == "admin".


@router.get("", response_model=list[AdminOut])
@limiter.limit("60/minute")
def list_admins(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    return (
        db.query(User)
        .filter(User.role == "admin")
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.post("", response_model=AdminCreateResult, status_code=status.HTTP_201_CREATED)
@limiter.limit("15/minute")
def create_admin(
    request: Request,
    payload: AdminIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists")

    temp_password = generate_temp_password()
    admin = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        region=payload.region,
        role="admin",
        hashed_password=hash_password(temp_password),
        is_active=True,
    )
    db.add(admin)
    record_event(db, "admin_created", role=claims["role"], actor_id=UUID(claims["sub"]), detail=payload.email)
    db.commit()
    db.refresh(admin)
    return AdminCreateResult(admin=AdminOut.model_validate(admin), login_email=payload.email, temp_password=temp_password)


def _get_admin_or_404(db: Session, admin_id: UUID) -> User:
    admin = db.query(User).filter(User.id == admin_id, User.role == "admin").first()
    if admin is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Admin not found")
    return admin


@router.patch("/{admin_id}", response_model=AdminOut)
@limiter.limit("30/minute")
def update_admin(
    request: Request,
    admin_id: UUID,
    payload: AdminUpdateIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    admin = _get_admin_or_404(db, admin_id)
    admin.name = payload.name
    admin.phone = payload.phone
    admin.region = payload.region
    record_event(db, "admin_updated", role=claims["role"], actor_id=UUID(claims["sub"]), detail=admin.email)
    db.commit()
    db.refresh(admin)
    return admin


@router.post("/{admin_id}/suspend", response_model=AdminOut)
@limiter.limit("30/minute")
def suspend_admin(
    request: Request,
    admin_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    admin = _get_admin_or_404(db, admin_id)
    if not admin.is_active:
        raise HTTPException(status.HTTP_409_CONFLICT, "Admin is already suspended")
    admin.is_active = False
    record_event(db, "admin_suspended", role=claims["role"], actor_id=UUID(claims["sub"]), detail=admin.email)
    db.commit()
    db.refresh(admin)
    return admin


@router.post("/{admin_id}/activate", response_model=AdminOut)
@limiter.limit("30/minute")
def activate_admin(
    request: Request,
    admin_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    admin = _get_admin_or_404(db, admin_id)
    if admin.is_active:
        raise HTTPException(status.HTTP_409_CONFLICT, "Admin is already active")
    admin.is_active = True
    record_event(db, "admin_activated", role=claims["role"], actor_id=UUID(claims["sub"]), detail=admin.email)
    db.commit()
    db.refresh(admin)
    return admin


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("15/minute")
def delete_admin(
    request: Request,
    admin_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    admin = _get_admin_or_404(db, admin_id)
    record_event(db, "admin_deleted", role=claims["role"], actor_id=UUID(claims["sub"]), detail=admin.email)
    db.delete(admin)
    db.commit()
