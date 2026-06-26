import pytest

from app.domain.enums import ScenarioType
from app.infrastructure.scenario_plugins.registry import ScenarioPluginRegistry


class FakePlugin:
    scenario_type = ScenarioType.TEXT

    async def get_scenario(self, context):
        return {}

    async def ensure_seed_data(self):
        return None


def test_registry_registers_plugin_by_type():
    registry = ScenarioPluginRegistry()
    plugin = FakePlugin()

    registry.register(plugin)

    assert registry.get(ScenarioType.TEXT) is plugin
    assert registry.types() == [ScenarioType.TEXT]


def test_registry_reports_missing_plugin():
    registry = ScenarioPluginRegistry()

    with pytest.raises(KeyError):
        registry.get(ScenarioType.AUDIO)
