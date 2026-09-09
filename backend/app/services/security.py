"""Password hashing and JWT issuing/verification."""

import logging
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import get_settings

logger = logging.getLogger(__name__)

ALGORITHM = "HS256"

_ephemeral_secret = secrets.token_urlsafe(48)


def _secret() -> str:
    settings = get_settings()
    if settings.jwt_secret:
        return settings.jwt_secret
    logger.warning("JWT_SECRET is not set; using a per-process secret. Tokens expire on restart.")
    return _ephemeral_secret


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


def create_token(user_id: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def read_token(token: str) -> str | None:
    """Return the user id encoded in a valid token, or None."""
    try:
        payload = jwt.decode(token, _secret(), algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
    subject = payload.get("sub")
    return subject if isinstance(subject, str) else None
