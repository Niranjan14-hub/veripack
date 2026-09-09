"""Bearer-token authentication dependency."""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db import get_user_repository
from app.models.user import UserPublic
from app.services import security

bearer = HTTPBearer(auto_error=False)

UNAUTHORIZED = HTTPException(
    status_code=401,
    detail="Sign in to continue.",
    headers={"WWW-Authenticate": "Bearer"},
)


async def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> UserPublic:
    if credentials is None:
        raise UNAUTHORIZED
    user_id = security.read_token(credentials.credentials)
    if user_id is None:
        raise UNAUTHORIZED
    document = await get_user_repository().get(user_id)
    if document is None:
        raise UNAUTHORIZED
    return UserPublic(**{key: document[key] for key in ("id", "email", "name", "created_at")})
