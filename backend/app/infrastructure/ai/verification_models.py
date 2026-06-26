from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass
class VerificationInput:
    scenario_id: str
    scenario_type: str
    title: str
    content: dict[str, Any]
    correct_label: str
    selected_label: str
    reasoning: str
    indicators: list[str]
    explanation: str

    def prompt_context(self) -> str:
        return (
            f"Scenario ID: {self.scenario_id}\n"
            f"Type: {self.scenario_type}\n"
            f"Title: {self.title}\n"
            f"Visible content: {self.content}\n"
            f"Ground truth label: {self.correct_label}\n"
            f"Known indicators: {self.indicators}\n"
            f"Reference explanation: {self.explanation}\n"
            f"User selected: {self.selected_label}\n"
            f"User reasoning: {self.reasoning}"
        )


@dataclass
class ProviderAnalysis:
    provider: str
    model: str
    verdict: str
    confidence: float
    is_user_correct: bool
    reasoning_score: float
    analysis: str
    evidence: list[str]
    missed_indicators: list[str]
    improvement_tips: list[str]
    status: str = "ok"
    error: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
