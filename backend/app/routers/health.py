import shutil

from fastapi import APIRouter

from app.config import get_settings
from app.db import get_repository

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health() -> dict:
    settings = get_settings()
    return {
        "status": "ok",
        "storage": get_repository().backend,
        "tesseract": bool(shutil.which("tesseract")),
        "structurer": "gemini" if settings.gemini_enabled else "heuristic",
    }
