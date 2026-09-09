"""Scan persistence with MongoDB Atlas, falling back to a local JSON store.

The local store keeps the prototype runnable (and demo-able) without Atlas
credentials; the interface is identical so swapping is transparent.
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
        self, page: int, page_size: int, verdict: str | None, category: str | None
    ) -> tuple[list[dict[str, Any]], int]:
        raise NotImplementedError

    async def get(self, scan_id: str) -> dict[str, Any] | None:
        raise NotImplementedError

    async def delete(self, scan_id: str) -> bool:
        raise NotImplementedError

    @property
    def backend(self) -> str:
        raise NotImplementedError


class MongoScanRepository(ScanRepository):
    def __init__(self, uri: str, database: str) -> None:
        from motor.motor_asyncio import AsyncIOMotorClient

        self._client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        self._collection = self._client[database]["scans"]

    @property
    def backend(self) -> str:
        return "mongodb"

    async def init(self) -> None:
        await self._collection.create_index("created_at")
        await self._collection.create_index("verdict")

    async def insert(self, scan: dict[str, Any]) -> None:
        await self._collection.insert_one({**scan, "_id": scan["id"]})

    async def list(
        self, page: int, page_size: int, verdict: str | None, category: str | None
    ) -> tuple[list[dict[str, Any]], int]:
        query: dict[str, Any] = {}
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

    async def get(self, scan_id: str) -> dict[str, Any] | None:
        return await self._collection.find_one({"_id": scan_id}, {"_id": 0})

    async def delete(self, scan_id: str) -> bool:
        result = await self._collection.delete_one({"_id": scan_id})
        return result.deleted_count > 0


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
        self, page: int, page_size: int, verdict: str | None, category: str | None
    ) -> tuple[list[dict[str, Any]], int]:
        scans = self._read()
        if verdict:
            scans = [s for s in scans if s.get("verdict") == verdict]
        if category:
            scans = [s for s in scans if s.get("category") == category]
        scans.sort(key=lambda s: str(s.get("created_at", "")), reverse=True)
        start = (page - 1) * page_size
        return scans[start : start + page_size], len(scans)

    async def get(self, scan_id: str) -> dict[str, Any] | None:
        return next((s for s in self._read() if s.get("id") == scan_id), None)

    async def delete(self, scan_id: str) -> bool:
        async with self._lock:
            scans = self._read()
            remaining = [s for s in scans if s.get("id") != scan_id]
            if len(remaining) == len(scans):
                return False
            self._write(remaining)
            return True


_repository: ScanRepository | None = None


async def init_repository() -> ScanRepository:
    global _repository
    settings = get_settings()
    if settings.mongo_enabled:
        try:
            repository: ScanRepository = MongoScanRepository(settings.mongodb_uri, settings.mongodb_db)
            await repository.init()
            logger.info("Connected to MongoDB Atlas.")
        except Exception as exc:  # noqa: BLE001 - degrade to local store
            logger.warning("MongoDB unavailable (%s); using local JSON store.", exc)
            repository = LocalScanRepository(settings.local_store_path)
    else:
        repository = LocalScanRepository(settings.local_store_path)
        logger.info("MONGODB_URI not set; using local JSON store.")
    _repository = repository
    return repository


def get_repository() -> ScanRepository:
    if _repository is None:
        raise RuntimeError("Repository is not initialised.")
    return _repository


def utcnow() -> datetime:
    return datetime.utcnow()
