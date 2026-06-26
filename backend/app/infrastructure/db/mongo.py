from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import Settings


class MongoDatabase:
    def __init__(self, settings: Settings):
        self._settings = settings
        self.client: AsyncIOMotorClient | None = None
        self.database: AsyncIOMotorDatabase | None = None

    async def connect(self) -> AsyncIOMotorDatabase:
        self.client = AsyncIOMotorClient(self._settings.mongodb_uri)
        self.database = self.client[self._settings.mongodb_db]
        await self.ensure_indexes()
        return self.database

    async def ensure_indexes(self) -> None:
        if self.database is None:
            raise RuntimeError("Mongo database is not connected")
        await self.database.users.create_index("email", unique=True)
        await self.database.scenarios.create_index("dataset_key", unique=True, sparse=True)
        await self.database.scenarios.create_index([("scenario_type", 1), ("is_active", 1)])
        await self.database.attempts.create_index([("user_id", 1), ("created_at", -1)])
        await self.database.attempts.create_index([("scenario_type", 1), ("created_at", -1)])

    async def close(self) -> None:
        if self.client:
            self.client.close()
