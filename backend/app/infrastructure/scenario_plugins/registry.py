from __future__ import annotations

import random

from app.domain.enums import ScenarioType
from app.infrastructure.scenario_plugins.base import ScenarioPlugin


class ScenarioPluginRegistry:
    def __init__(self) -> None:
        self._plugins: dict[ScenarioType, ScenarioPlugin] = {}

    def register(self, plugin: ScenarioPlugin) -> None:
        self._plugins[plugin.scenario_type] = plugin

    def get(self, scenario_type: ScenarioType) -> ScenarioPlugin:
        if scenario_type not in self._plugins:
            raise KeyError(f"No scenario plugin registered for {scenario_type}")
        return self._plugins[scenario_type]

    def types(self) -> list[ScenarioType]:
        return list(self._plugins.keys())

    def random_type(self, *, include_text: bool = True) -> ScenarioType:
        choices = [item for item in self.types() if include_text or item is not ScenarioType.TEXT]
        if not choices:
            raise RuntimeError("No scenario plugins registered")
        return random.choice(choices)
