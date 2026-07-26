from app.schemas.base import CamelModel


class TokenOut(CamelModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class LoginIn(CamelModel):
    email: str
    password: str


class StaffRegisterIn(CamelModel):
    name: str
    email: str
    password: str
    role: str  # 'admin' | 'superadmin' -- gate this behind an existing superadmin in practice
