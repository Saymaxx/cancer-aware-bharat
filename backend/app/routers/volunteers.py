from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.limiter import limiter
from app.deps import DbSession, require_volunteer
from app.models.volunteer import Volunteer
from app.schemas.volunteer import VolunteerOut

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.get("/me", response_model=VolunteerOut)
@limiter.limit("60/minute")
def get_my_profile(request: Request, db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    volunteer = db.query(Volunteer).filter(Volunteer.id == UUID(claims["sub"])).first()
    if volunteer is None:
        # A still-valid token whose volunteer row was since deleted --
        # without this, returning None through response_model=VolunteerOut
        # fails FastAPI's response validation and surfaces as an unlogged 500.
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volunteer not found")
    return volunteer
