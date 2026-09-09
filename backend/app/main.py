import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.db import init_repository
from app.routers import auth, health, scans

logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    Path(settings.media_path).mkdir(parents=True, exist_ok=True)
    await init_repository()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    Path(settings.media_path).mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=settings.media_path), name="media")
    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(scans.router)
    return app


app = create_app()
