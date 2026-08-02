from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func

from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.custom_role import CustomRole
from app.models.user import User
from app.schemas.custom_role import CustomRoleIn, CustomRoleOut
from app.services.audit import record_event

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("", response_model=list[CustomRoleOut])
@limiter.limit("60/minute")
def list_roles(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
):
    roles = (
        db.query(CustomRole)
        .order_by(CustomRole.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    counts = dict(
        db.query(User.custom_role_id, func.count(User.id))
        .filter(User.custom_role_id.isnot(None))
        .group_by(User.custom_role_id)
        .all()
    )
    results = []
    for role in roles:
        out = CustomRoleOut.model_validate(role)
        out.assigned_count = counts.get(role.id, 0)
        results.append(out)
    return results


@router.post("", response_model=CustomRoleOut, status_code=status.HTTP_201_CREATED)
@limiter.limit("30/minute")
def create_role(
    request: Request,
    payload: CustomRoleIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    role = CustomRole(**payload.model_dump(), is_system=False)
    db.add(role)
    record_event(db, "role_created", role=claims["role"], actor_id=UUID(claims["sub"]), detail=role.name)
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("30/minute")
def delete_role(
    request: Request,
    role_id: UUID,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    role = db.query(CustomRole).filter(CustomRole.id == role_id).first()
    if role is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Role not found")
    if role.is_system:
        raise HTTPException(status.HTTP_409_CONFLICT, "System roles cannot be deleted")
    record_event(db, "role_deleted", role=claims["role"], actor_id=UUID(claims["sub"]), detail=role.name)
    db.delete(role)
    db.commit()
