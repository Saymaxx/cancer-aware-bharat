from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends

from app.deps import DbSession, require_volunteer
from app.models.volunteer import Volunteer
from app.schemas.volunteer import VolunteerOut

router = APIRouter(prefix="/volunteers", tags=["volunteers"])


@router.get("/me", response_model=VolunteerOut)
def get_my_profile(db: DbSession, claims: Annotated[dict, Depends(require_volunteer)]):
    return db.query(Volunteer).filter(Volunteer.id == UUID(claims["sub"])).first()
