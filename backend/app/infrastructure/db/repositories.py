from __future__ import annotations

from datetime import datetime, time, timezone
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.domain.entities import default_stats, utcnow
from app.domain.enums import ScenarioType, UserRole


def _serialize(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    serialized = dict(document)
    if "_id" in serialized:
        serialized["id"] = str(serialized.pop("_id"))
    return serialized


def _object_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise ValueError("Invalid object id")
    return ObjectId(value)


class MongoUserRepository:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.users

    async def create_user(
        self,
        *,
        email: str,
        password_hash: str,
        full_name: str,
        role: UserRole = UserRole.LEARNER,
    ) -> dict[str, Any]:
        now = utcnow()
        document = {
            "email": email.lower(),
            "password_hash": password_hash,
            "full_name": full_name,
            "role": role.value,
            "stats": default_stats(),
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(document)
        document["_id"] = result.inserted_id
        return _serialize(document) or {}

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        return _serialize(await self.collection.find_one({"email": email.lower()}))

    async def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        try:
            return _serialize(await self.collection.find_one({"_id": _object_id(user_id)}))
        except ValueError:
            return None

    async def update_stats(self, user_id: str, stats: dict[str, Any]) -> None:
        await self.collection.update_one(
            {"_id": _object_id(user_id)},
            {"$set": {"stats": stats, "updated_at": utcnow()}},
        )

    async def mark_login(self, user_id: str) -> None:
        await self.collection.update_one(
            {"_id": _object_id(user_id)},
            {"$set": {"last_login_at": utcnow(), "updated_at": utcnow()}},
        )

    async def count(self) -> int:
        return await self.collection.count_documents({})


class MongoScenarioRepository:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.scenarios

    async def get_by_id(self, scenario_id: str) -> dict[str, Any] | None:
        try:
            return _serialize(await self.collection.find_one({"_id": _object_id(scenario_id)}))
        except ValueError:
            return None

    async def insert(self, scenario: dict[str, Any]) -> dict[str, Any]:
        now = utcnow()
        scenario = dict(scenario)
        scenario.setdefault("created_at", now)
        scenario["updated_at"] = now
        result = await self.collection.insert_one(scenario)
        scenario["_id"] = result.inserted_id
        return _serialize(scenario) or {}

    async def upsert_by_dataset_key(self, scenario: dict[str, Any]) -> None:
        now = utcnow()
        scenario = dict(scenario)
        created_at = scenario.pop("created_at", now)
        scenario["updated_at"] = now
        await self.collection.find_one_and_update(
            {"dataset_key": scenario["dataset_key"]},
            {"$set": scenario, "$setOnInsert": {"created_at": created_at}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    async def random_by_type(
        self,
        scenario_type: ScenarioType,
        *,
        difficulty: int | None = None,
        exclude_ids: list[str] | None = None,
    ) -> dict[str, Any] | None:
        match: dict[str, Any] = {"scenario_type": scenario_type.value, "is_active": True}
        if difficulty:
            match["difficulty"] = {"$lte": difficulty}
        if exclude_ids:
            object_ids = [ObjectId(item) for item in exclude_ids if ObjectId.is_valid(item)]
            if object_ids:
                match["_id"] = {"$nin": object_ids}
        docs = await self.collection.aggregate([{"$match": match}, {"$sample": {"size": 1}}]).to_list(1)
        return _serialize(docs[0]) if docs else None

    async def count_by_type(self) -> list[dict[str, Any]]:
        rows = await self.collection.aggregate(
            [
                {"$match": {"is_active": True}},
                {"$group": {"_id": "$scenario_type", "count": {"$sum": 1}}},
                {"$sort": {"_id": 1}},
            ]
        ).to_list(None)
        return [{"scenario_type": row["_id"], "count": row["count"]} for row in rows]


class MongoAttemptRepository:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.collection = database.attempts

    async def create(self, attempt: dict[str, Any]) -> dict[str, Any]:
        attempt = dict(attempt)
        attempt.setdefault("created_at", utcnow())
        result = await self.collection.insert_one(attempt)
        attempt["_id"] = result.inserted_id
        return _serialize(attempt) or {}

    async def recent_for_user(self, user_id: str, *, limit: int = 20) -> list[dict[str, Any]]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        return [_serialize(doc) or {} async for doc in cursor]

    async def history_for_user(self, user_id: str, *, limit: int = 100) -> list[dict[str, Any]]:
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        return list(reversed([_serialize(doc) or {} async for doc in cursor]))

    async def leaderboard(self, *, limit: int = 10) -> list[dict[str, Any]]:
        return await self.collection.aggregate(
            [
                {
                    "$group": {
                        "_id": "$user_id",
                        "attempts": {"$sum": 1},
                        "correct": {"$sum": {"$cond": ["$is_correct", 1, 0]}},
                        "reasoning_average": {"$avg": "$reasoning_score"},
                        "last_attempt_at": {"$max": "$created_at"},
                    }
                },
                {
                    "$addFields": {
                        "accuracy": {
                            "$cond": [
                                {"$eq": ["$attempts", 0]},
                                0,
                                {"$divide": ["$correct", "$attempts"]},
                            ]
                        }
                    }
                },
                {"$sort": {"accuracy": -1, "correct": -1, "reasoning_average": -1}},
                {"$limit": limit},
            ]
        ).to_list(None)

    async def count(self) -> int:
        return await self.collection.count_documents({})

    async def count_today(self) -> int:
        start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
        return await self.collection.count_documents({"created_at": {"$gte": start}})
