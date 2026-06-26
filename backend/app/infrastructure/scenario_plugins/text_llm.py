from __future__ import annotations

import random
from typing import Any

from app.domain.entities import utcnow
from app.domain.enums import ScenarioType, TruthLabel
from app.domain.repositories import ScenarioRepository
from app.infrastructure.ai.text_generator import OpenSourceTextGenerator
from app.infrastructure.scenario_plugins.base import ScenarioRequestContext


class TextLLMScenarioPlugin:
    scenario_type = ScenarioType.TEXT

    def __init__(self, *, repository: ScenarioRepository, generator: OpenSourceTextGenerator):
        self.repository = repository
        self.generator = generator

    async def ensure_seed_data(self) -> None:
        return None

    async def get_scenario(self, context: ScenarioRequestContext) -> dict[str, Any]:
        label = random.choice([TruthLabel.FAKE, TruthLabel.GENUINE])
        generated = await self.generator.generate(
            label=label,
            difficulty=context.difficulty,
            mode=context.mode,
        )
        now = utcnow()
        scenario = {
            "scenario_type": self.scenario_type.value,
            "label": label.value,
            "title": generated["title"],
            "content": generated["content"],
            "indicators": generated["indicators"],
            "explanation": generated["explanation"],
            "difficulty": generated.get("difficulty", context.difficulty),
            "tags": generated.get("tags", ["text", "llm_generated"]),
            "source": f"llm:{self.generator.model_name}",
            "dataset_key": None,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        return await self.repository.insert(scenario)
