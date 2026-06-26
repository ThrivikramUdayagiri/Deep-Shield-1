from __future__ import annotations

from typing import Any, Protocol

from app.domain.enums import ScenarioType, UserRole


class UserRepository(Protocol):
    async def create_user(
        self,
        *,
        email: str,
        password_hash: str,
        full_name: str,
        role: UserRole,
    ) -> dict[str, Any]:
        ...

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        ...

    async def get_by_id(self, user_id: str) -> dict[str, Any] | None:
        ...

    async def update_stats(self, user_id: str, stats: dict[str, Any]) -> None:
        ...

    async def count(self) -> int:
        ...


class ScenarioRepository(Protocol):
    async def get_by_id(self, scenario_id: str) -> dict[str, Any] | None:
        ...

    async def insert(self, scenario: dict[str, Any]) -> dict[str, Any]:
        ...

    async def upsert_by_dataset_key(self, scenario: dict[str, Any]) -> None:
        ...

    async def random_by_type(
        self,
        scenario_type: ScenarioType,
        *,
        difficulty: int | None = None,
        exclude_ids: list[str] | None = None,
    ) -> dict[str, Any] | None:
        ...

    async def count_by_type(self) -> list[dict[str, Any]]:
        ...


class AttemptRepository(Protocol):
    async def create(self, attempt: dict[str, Any]) -> dict[str, Any]:
        ...

    async def recent_for_user(self, user_id: str, *, limit: int = 20) -> list[dict[str, Any]]:
        ...

    async def history_for_user(self, user_id: str, *, limit: int = 100) -> list[dict[str, Any]]:
        ...

    async def leaderboard(self, *, limit: int = 10) -> list[dict[str, Any]]:
        ...

    async def count(self) -> int:
        ...

    async def count_today(self) -> int:
        ...
