from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from app.domain.enums import ScenarioType


@dataclass
class ScenarioRequestContext:
    user_id: str
    mode: str
    difficulty: int = 3
    exclude_ids: list[str] | None = None


class ScenarioPlugin(Protocol):
    scenario_type: ScenarioType

    async def get_scenario(self, context: ScenarioRequestContext) -> dict[str, Any]:
        ...

    async def ensure_seed_data(self) -> None:
        ...
