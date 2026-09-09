from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "VeriPack API"
    mongodb_uri: str = ""
    mongodb_db: str = "veripack"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    max_upload_bytes: int = 10 * 1024 * 1024
    local_store_path: str = "./data/scans.json"
    local_user_store_path: str = "./data/users.json"
    media_path: str = "./data/media"
    jwt_secret: str = ""
    jwt_expire_minutes: int = 60 * 24 * 7

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key)

    @property
    def mongo_enabled(self) -> bool:
        return bool(self.mongodb_uri)


@lru_cache
def get_settings() -> Settings:
    return Settings()
