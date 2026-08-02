from uuid import UUID

from pydantic import Field

from app.schemas.base import CamelModel


class TokenOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class LoginIn(CamelModel):
    email: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=128)


class StaffMeOut(CamelModel):
    id: UUID
    name: str
    email: str
    role: str


class StaffMeUpdateIn(CamelModel):
    # Email is deliberately not editable here -- it's the login identifier,
    # same restriction the Admin Management edit form already applies.
    name: str = Field(min_length=1, max_length=200)


class StaffChangePasswordIn(CamelModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class StaffRegisterIn(CamelModel):
    name: str
    email: str
    password: str
    role: str  # 'admin' | 'superadmin' -- gate this behind an existing superadmin in practice
