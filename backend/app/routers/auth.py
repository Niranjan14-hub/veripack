import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.auth import current_user
from app.db import get_user_repository
from app.models.user import AuthResponse, LoginRequest, SignupRequest, UserPublic
from app.services import security

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _normalise(email: str) -> str:
    return email.strip().lower()


@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(payload: SignupRequest) -> AuthResponse:
    users = get_user_repository()
    email = _normalise(payload.email)
    if await users.get_by_email(email):
        raise HTTPException(status_code=409, detail="An account with that email already exists.")

    user = {
        "id": uuid.uuid4().hex[:12],
        "email": email,
        "name": payload.name.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "password_hash": security.hash_password(payload.password),
    }
    await users.insert(user)
    return AuthResponse(token=security.create_token(user["id"]), user=UserPublic(**user))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> AuthResponse:
    document = await get_user_repository().get_by_email(_normalise(payload.email))
    if not document or not security.verify_password(payload.password, document["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    return AuthResponse(
        token=security.create_token(document["id"]),
        user=UserPublic(**document),
    )


@router.get("/me", response_model=UserPublic)
async def me(user: UserPublic = Depends(current_user)) -> UserPublic:
    return user
