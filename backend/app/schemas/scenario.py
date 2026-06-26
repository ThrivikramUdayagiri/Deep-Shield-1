from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from app.domain.enums import ScenarioType, TrainingMode, TruthLabel


class ScenarioOut(BaseModel):
    id: str
    scenario_type: ScenarioType
    title: str
    content: dict[str, Any]
    difficulty: int
    tags: list[str]
    source: str


class SubmitAttemptRequest(BaseModel):
    scenario_id: str
    selected_label: TruthLabel
    reasoning: str = Field(min_length=5, max_length=3000)


class NextScenarioQuery(BaseModel):
    mode: TrainingMode = TrainingMode.QUICK
    scenario_type: ScenarioType | None = None


class AttemptResult(BaseModel):
    attempt: dict[str, Any]
    evaluation: dict[str, Any]
    scenario: dict[str, Any]
    stats: dict[str, Any]
