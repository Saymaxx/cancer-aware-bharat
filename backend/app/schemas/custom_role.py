from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class CustomRoleIn(CamelModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)
    permissions: list[str] = []


class CustomRoleOut(CamelModel):
    id: UUID
    name: str
    description: str
    permissions: list[str]
    is_system: bool
    # No assignment mechanism exists -- always 0, never fabricated (see
    # CustomRole model docstring).
    assigned_count: int = 0
    created_at: datetime
