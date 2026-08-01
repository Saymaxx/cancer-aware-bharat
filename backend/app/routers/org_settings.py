from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request

from app.core.limiter import limiter
from app.deps import DbSession, require_roles
from app.models.org_settings import OrgSettings
from app.schemas.org_settings import OrgSettingsIn, OrgSettingsOut
from app.services.audit import record_event

router = APIRouter(prefix="/org-settings", tags=["org-settings"])


def _get_or_create(db: DbSession) -> OrgSettings:
    settings_row = db.query(OrgSettings).filter(OrgSettings.id == 1).first()
    if settings_row is None:
        settings_row = OrgSettings(id=1)
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


@router.get("", response_model=OrgSettingsOut)
@limiter.limit("60/minute")
def get_org_settings(
    request: Request,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    return _get_or_create(db)


@router.patch("", response_model=OrgSettingsOut)
@limiter.limit("15/minute")
def update_org_settings(
    request: Request,
    payload: OrgSettingsIn,
    db: DbSession,
    claims: Annotated[dict, Depends(require_roles("superadmin"))],
):
    settings_row = _get_or_create(db)
    for field, value in payload.model_dump().items():
        setattr(settings_row, field, value)
    record_event(db, "org_settings_updated", role=claims["role"], actor_id=UUID(claims["sub"]))
    db.commit()
    db.refresh(settings_row)
    return settings_row
