from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.domain.entities import utcnow
from app.domain.enums import ScenarioType
from app.domain.repositories import ScenarioRepository
from app.infrastructure.datasets.asset_manager import DatasetAssetManager
from app.infrastructure.scenario_plugins.base import ScenarioRequestContext


class DatasetManifestLoader:
    def __init__(self, *, manifest_dir: Path, asset_manager: DatasetAssetManager):
        self.manifest_dir = manifest_dir
        self.asset_manager = asset_manager

    async def seed(self, repository: ScenarioRepository) -> None:
        for path in sorted(self.manifest_dir.glob("*.json")):
            for entry in json.loads(path.read_text(encoding="utf-8")):
                now = utcnow()
                content = self.asset_manager.ensure_assets(
                    scenario_type=entry["scenario_type"],
                    dataset_key=entry["dataset_key"],
                    content=entry["content"],
                )
                scenario = {
                    "dataset_key": entry["dataset_key"],
                    "scenario_type": entry["scenario_type"],
                    "label": entry["label"],
                    "title": entry["title"],
                    "content": content,
                    "indicators": entry["indicators"],
                    "explanation": entry["explanation"],
                    "difficulty": entry.get("difficulty", 1),
                    "tags": entry.get("tags", []),
                    "source": entry.get("source", "managed_dataset"),
                    "is_active": entry.get("is_active", True),
                    "created_at": now,
                    "updated_at": now,
                }
                await repository.upsert_by_dataset_key(scenario)


class DatasetScenarioPlugin:
    def __init__(self, *, scenario_type: ScenarioType, repository: ScenarioRepository, loader: DatasetManifestLoader):
        self.scenario_type = scenario_type
        self.repository = repository
        self.loader = loader

    async def ensure_seed_data(self) -> None:
        await self.loader.seed(self.repository)

    async def get_scenario(self, context: ScenarioRequestContext) -> dict[str, Any]:
        scenario = await self.repository.random_by_type(
            self.scenario_type,
            difficulty=context.difficulty,
            exclude_ids=context.exclude_ids,
        )
        if scenario is None:
            await self.ensure_seed_data()
            scenario = await self.repository.random_by_type(self.scenario_type, difficulty=context.difficulty)
        if scenario is None:
            raise LookupError(f"No dataset scenarios available for {self.scenario_type.value}")
        return scenario
