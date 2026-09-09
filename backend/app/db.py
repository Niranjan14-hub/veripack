"""Scan and user persistence with MongoDB Atlas, falling back to local JSON stores.

The local stores keep the prototype runnable (and demo-able) without Atlas
credentials; the interfaces are identical so swapping is transparent.
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from app.config import get_settings

logger = logging.getLogger(__name__)


class ScanRepository:
    async def init(self) -> None:  # pragma: no cover - trivial
        return None

    async def insert(self, scan: dict[str, Any]) -> None:
        raise NotImplementedError

    async def list(
        self,
        user_id: str,
        page: int,
        page_size: int,
        verdict: str | None,
        category: str | None,
    ) -> tuple[list[dict[str, Any]], int]:
        raise NotImplementedError

    async def get(self, scan_id: str, user_id: str) -> dict[str, Any] | None:
        raise NotImplementedError

    async def delete(self, scan_id: str, user_id: str) -> bool:
        raise NotImplementedError

    @property
    def backend(self) -> str:
        raise NotImplementedError


class UserRepository:
    async def init(self) -> None:  # pragma: no cover - trivial
        return None

    async def insert(self, user: dict[str, Any]) -> None:
        raise NotImplementedError

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        raise NotImplementedError

    async def get(self, user_id: str) -> dict[str, Any] | None:
        raise NotImplementedError


class MongoScanRepository(ScanRepository):
    def __init__(self, uri: str, database: str) -> None:
        from motor.motor_asyncio import AsyncIOMotorClient

        self._client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        self._collection = self._client[database]["scans"]

    @property
    def client(self) -> Any:
        return self._client

    @property
    def backend(self) -> str:
        return "mongodb"

    async def init(self) -> None:
        await self._collection.create_index([("user_id", 1), ("created_at", -1)])
        await self._collection.create_index("verdict")

    async def insert(self, scan: dict[str, Any]) -> None:
        await self._collection.insert_one({**scan, "_id": scan["id"]})

    async def list(
        self,
        user_id: str,
        page: int,
        page_size: int,
        verdict: str | None,
        category: str | None,
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {"user_id": user_id}
        if verdict:
            query["verdict"] = verdict
        if category:
            query["category"] = category
        total = await self._collection.count_documents(query)
        cursor = (
            self._collection.find(query, {"_id": 0})
            .sort("created_at", -1)
            .skip((page - 1) * page_size)
            .limit(page_size)
        )
        return [doc async for doc in cursor], total

    async def get(self, scan_id: str, user_id: str) -> dict[str, Any] | None:
        return await self._collection.find_one({"_id": scan_id, "user_id": user_id}, {"_id": 0})

    async def delete(self, scan_id: str, user_id: str) -> bool:
        result = await self._collection.delete_one({"_id": scan_id, "user_id": user_id})
        return result.deleted_count > 0


class MongoUserRepository(UserRepository):
    def __init__(self, client: Any, database: str) -> None:
        self._collection = client[database]["users"]

    async def init(self) -> None:
        await self._collection.create_index("email", unique=True)

    async def insert(self, user: dict[str, Any]) -> None:
        await self._collection.insert_one({**user, "_id": user["id"]})

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        return await self._collection.find_one({"email": email}, {"_id": 0})

    async def get(self, user_id: str) -> dict[str, Any] | None:
        return await self._collection.find_one({"_id": user_id}, {"_id": 0})


class LocalScanRepository(ScanRepository):
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()

    @property
    def backend(self) -> str:
        return "local-json"

    def _read(self) -> list[dict[str, Any]]:
        if not self._path.exists():
            return []
        try:
            return json.loads(self._path.read_text())
        except json.JSONDecodeError:
            logger.warning("Local scan store is corrupt; starting empty.")
            return []

    def _write(self, scans: list[dict[str, Any]]) -> None:
        self._path.write_text(json.dumps(scans, indent=2, default=str))

    async def insert(self, scan: dict[str, Any]) -> None:
        async with self._lock:
            scans = self._read()
            scans.append(scan)
            self._write(scans)

    async def list(
        self,
        user_id: str,
        page: int,
        page_size: int,
        verdict: str | None,
        category: str | None,
    ) -> tuple[list[dict[str, Any]], int]:
        scans = [s for s in self._read() if s.get("user_id") == user_id]
        if verdict:
            scans = [s for s in scans if s.get("verdict") == verdict]
        if category:
            scans = [s for s in scans if s.get("category") == category]
        scans.sort(key=lambda s: str(s.get("created_at", "")), reverse=True)
        start = (page - 1) * page_size
        return scans[start : start + page_size], len(scans)

    async def get(self, scan_id: str, user_id: str) -> dict[str, Any] | None:
        return next(
            (
                s
                for s in self._read()
                if s.get("id") == scan_id and s.get("user_id") == user_id
            ),
            None,
        )

    async def delete(self, scan_id: str, user_id: str) -> bool:
        async with self._lock:
            scans = self._read()
            remaining = [
                s
                for s in scans
                if not (s.get("id") == scan_id and s.get("user_id") == user_id)
            ]
            if len(remaining) == len(scans):
                return False
            self._write(remaining)
            return True


class LocalUserRepository(UserRepository):
    def __init__(self, path: str) -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()

    def _read(self) -> list[dict[str, Any]]:
        if not self._path.exists():
            return []
        try:
            return json.loads(self._path.read_text())
        except json.JSONDecodeError:
            logger.warning("Local user store is corrupt; starting empty.")
            return []

    async def insert(self, user: dict[str, Any]) -> None:
        async with self._lock:
            users = self._read()
            users.append(user)
            self._path.write_text(json.dumps(users, indent=2, default=str))

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        return next((u for u in self._read() if u.get("email") == email), None)

    async def get(self, user_id: str) -> dict[str, Any] | None:
        return next((u for u in self._read() if u.get("id") == user_id), None)


_repository: ScanRepository | None = None
_user_repository: UserRepository | None = None


def _local_repositories(settings: Any) -> tuple[ScanRepository, UserRepository]:
    return (
        LocalScanRepository(settings.local_store_path),
        LocalUserRepository(settings.local_user_store_path),
    )


async def init_repository() -> ScanRepository:
    global _repository, _user_repository
    settings = get_settings()
    if settings.mongo_enabled:
        try:
            scans = MongoScanRepository(settings.mongodb_uri, settings.mongodb_db)
            users: UserRepository = MongoUserRepository(scans.client, settings.mongodb_db)
            await scans.init()
            await users.init()
            repository: ScanRepository = scans
            logger.info("Connected to MongoDB Atlas.")
        except Exception as exc:  # noqa: BLE001 - degrade to local store
            logger.warning("MongoDB unavailable (%s); using local JSON store.", exc)
            repository, users = _local_repositories(settings)
    else:
        repository, users = _local_repositories(settings)
        logger.info("MONGODB_URI not set; using local JSON store.")
    _repository = repository
    _user_repository = users
    return repository


def get_repository() -> ScanRepository:
    if _repository is None:
        raise RuntimeError("Repository is not initialised.")
    return _repository


def get_user_repository() -> UserRepository:
    if _user_repository is None:
        raise RuntimeError("User repository is not initialised.")
    return _user_repository


def utcnow() -> datetime:
    return datetime.utcnow()
