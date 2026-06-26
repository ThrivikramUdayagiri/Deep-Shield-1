from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from app.domain.enums import ScenarioType, TruthLabel, UserRole


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def default_stats() -> dict[str, Any]:
    return {
        "attempts": 0,
        "correct": 0,
        "accuracy": 0.0,
        "streak": 0,
        "best_streak": 0,
        "reasoning_average": 0.0,
        "skill_score": 0,
        "by_type": {},
        "achievements": [],
        "last_attempt_at": None,
    }


@dataclass
class User:
    id: str | None
    email: str
    password_hash: str
    full_name: str
    role: UserRole = UserRole.LEARNER
    stats: dict[str, Any] = field(default_factory=default_stats)
    created_at: datetime = field(default_factory=utcnow)
    updated_at: datetime = field(default_factory=utcnow)


@dataclass
class Scenario:
    id: str | None
    scenario_type: ScenarioType
    label: TruthLabel
    title: str
    content: dict[str, Any]
    indicators: list[str]
    explanation: str
    difficulty: int = 1
    tags: list[str] = field(default_factory=list)
    source: str = "dataset"
    dataset_key: str | None = None
    is_active: bool = True
    created_at: datetime = field(default_factory=utcnow)
    updated_at: datetime = field(default_factory=utcnow)


@dataclass
class Attempt:
    id: str | None
    user_id: str
    scenario_id: str
    scenario_type: ScenarioType
    selected_label: TruthLabel
    correct_label: TruthLabel
    reasoning: str
    is_correct: bool
    reasoning_score: float
    feedback: str
    matched_indicators: list[str]
    missed_indicators: list[str]
    created_at: datetime = field(default_factory=utcnow)
