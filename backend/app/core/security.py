import secrets
import string
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_numeric_id(digits: int = 7) -> str:
    """Cryptographically-random numeric suffix for public-facing IDs
    (enquiry/reference/appointment/volunteer numbers).

    Previously these used `random.randint`, which is a Mersenne Twister --
    not cryptographically secure -- over only a 5-digit (90,000-value)
    space. Reference numbers are looked up publicly (paired with a phone
    number) via /enquiries/lookup, so a predictable, brute-forceable ID is
    a real exposure. `secrets` + a wider keyspace closes both gaps.
    """
    return "".join(secrets.choice(string.digits) for _ in range(digits))


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, role: str, extra_claims: dict | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    # jti gives every token a unique, revocable identity -- without it,
    # "logout" can only ever be a client-side localStorage.removeItem, and
    # a token that leaked (or a session an admin needs to kill) stays valid
    # until it naturally expires no matter what the server does.
    to_encode = {"sub": subject, "role": role, "exp": expire, "jti": str(uuid.uuid4())}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError:
        return None
