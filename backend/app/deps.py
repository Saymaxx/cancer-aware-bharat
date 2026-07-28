from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.revoked_token import RevokedToken

bearer_scheme = HTTPBearer(auto_error=False)

DbSession = Annotated[Session, Depends(get_db)]


def get_current_claims(
    db: DbSession,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    claims = decode_access_token(credentials.credentials)
    if claims is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    # Tokens issued before the jti/revocation table existed have no "jti"
    # claim and simply can't be revoked -- they just expire on their own
    # TTL as before, so this stays backward compatible.
    jti = claims.get("jti")
    if jti and db.query(RevokedToken).filter(RevokedToken.jti == jti).first() is not None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token has been revoked")
    return claims


def require_roles(*allowed_roles: str):
    def _dependency(claims: Annotated[dict, Depends(get_current_claims)]) -> dict:
        if claims.get("role") not in allowed_roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Insufficient permissions")
        return claims

    return _dependency


require_admin = require_roles("admin")
require_superadmin = require_roles("superadmin")
require_admin_or_superadmin = require_roles("admin", "superadmin")
require_hospital = require_roles("hospital")
require_volunteer = require_roles("volunteer")


def current_hospital_id(claims: Annotated[dict, Depends(require_hospital)]) -> UUID:
    return UUID(claims["sub"])
