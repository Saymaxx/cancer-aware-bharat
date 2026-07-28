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


class StaffRegisterIn(CamelModel):
    name: str
    email: str
    password: str
    role: str  # 'admin' | 'superadmin' -- gate this behind an existing superadmin in practice
