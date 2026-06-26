from __future__ import annotations

import random
from typing import Any

from app.application.achievement_service import AchievementService
from app.application.evaluation_service import EvaluationService
from app.domain.entities import utcnow
from app.domain.enums import ScenarioType, TrainingMode, TruthLabel
from app.domain.repositories import AttemptRepository, ScenarioRepository, UserRepository
from app.infrastructure.scenario_plugins.base import ScenarioRequestContext
from app.infrastructure.scenario_plugins.registry import ScenarioPluginRegistry


class ScenarioService:
    def __init__(
        self,
        *,
        users: UserRepository,
        scenarios: ScenarioRepository,
        attempts: AttemptRepository,
        registry: ScenarioPluginRegistry,
        evaluator: EvaluationService,
        achievements: AchievementService,
    ):
        self.users = users
        self.scenarios = scenarios
        self.attempts = attempts
        self.registry = registry
        self.evaluator = evaluator
        self.achievements = achievements

    async def next_scenario(
        self,
        *,
        user: dict[str, Any],
        mode: TrainingMode,
        scenario_type: ScenarioType | None = None,
    ) -> dict[str, Any]:
        selected_type = scenario_type or self._select_type(user.get("stats", {}), mode)
        context = ScenarioRequestContext(
            user_id=user["id"],
            mode=mode.value,
            difficulty=self._difficulty_for_user(user.get("stats", {}), mode),
        )
        return await self.registry.get(selected_type).get_scenario(context)

    async def submit_attempt(
        self,
        *,
        user: dict[str, Any],
        scenario_id: str,
        selected_label: TruthLabel,
        reasoning: str,
    ) -> dict[str, Any]:
        scenario = await self.scenarios.get_by_id(scenario_id)
        if scenario is None:
            raise LookupError("Scenario not found")
        evaluation = await self.evaluator.evaluate(
            scenario=scenario,
            selected_label=selected_label,
            reasoning=reasoning,
        )
        attempt = {
            "user_id": user["id"],
            "scenario_id": scenario_id,
            "scenario_type": scenario["scenario_type"],
            "selected_label": selected_label.value,
            "correct_label": scenario["label"],
            "reasoning": reasoning,
            "is_correct": evaluation["is_correct"],
            "reasoning_score": evaluation["reasoning_score"],
            "overall_score": evaluation["overall_score"],
            "feedback": evaluation["feedback"],
            "matched_indicators": evaluation["matched_indicators"],
            "missed_indicators": evaluation["missed_indicators"],
            "gemini_analysis": evaluation.get("gemini_analysis"),
            "huggingface_analysis": evaluation.get("huggingface_analysis"),
            "final_report": evaluation.get("final_report"),
            "created_at": utcnow(),
        }
        saved_attempt = await self.attempts.create(attempt)
        updated_stats = self._updated_stats(user.get("stats", {}), scenario["scenario_type"], evaluation)
        await self.users.update_stats(user["id"], updated_stats)
        return {
            "attempt": saved_attempt,
            "evaluation": evaluation,
            "scenario": self._result_scenario(scenario),
            "stats": updated_stats,
        }

    def _select_type(self, stats: dict[str, Any], mode: TrainingMode) -> ScenarioType:
        if mode is TrainingMode.TEXT_ONLY:
            return ScenarioType.TEXT
        if mode is TrainingMode.MULTIMODAL:
            return self.registry.random_type(include_text=False)
        if mode is TrainingMode.WEAKNESS_DRILL:
            by_type = stats.get("by_type", {})
            weak = sorted(
                (
                    (ScenarioType(key), value.get("accuracy", 1.0))
                    for key, value in by_type.items()
                    if key in ScenarioType._value2member_map_ and value.get("attempts", 0) > 0
                ),
                key=lambda item: item[1],
            )
            if weak:
                return weak[0][0]
        if mode is TrainingMode.ADVANCED:
            return random.choice([ScenarioType.WEBSITE, ScenarioType.VIDEO, ScenarioType.QR_CODE, ScenarioType.TEXT])
        return self.registry.random_type(include_text=True)

    def _difficulty_for_user(self, stats: dict[str, Any], mode: TrainingMode) -> int:
        attempts = stats.get("attempts", 0)
        accuracy = stats.get("accuracy", 0)
        if mode is TrainingMode.ADVANCED:
            return 5
        if attempts >= 20 and accuracy >= 0.8:
            return 5
        if attempts >= 10 and accuracy >= 0.7:
            return 4
        if attempts >= 4:
            return 3
        return 2

    def _updated_stats(
        self,
        stats: dict[str, Any],
        scenario_type: str,
        evaluation: dict[str, Any],
    ) -> dict[str, Any]:
        stats = dict(stats or {})
        attempts = int(stats.get("attempts", 0)) + 1
        correct = int(stats.get("correct", 0)) + (1 if evaluation["is_correct"] else 0)
        streak = int(stats.get("streak", 0))
        streak = streak + 1 if evaluation["is_correct"] else 0
        previous_reasoning = float(stats.get("reasoning_average", 0))
        reasoning_average = ((previous_reasoning * (attempts - 1)) + evaluation["reasoning_score"]) / attempts

        by_type = dict(stats.get("by_type", {}))
        type_stats = dict(by_type.get(scenario_type, {"attempts": 0, "correct": 0, "reasoning_average": 0.0}))
        type_attempts = int(type_stats.get("attempts", 0)) + 1
        type_correct = int(type_stats.get("correct", 0)) + (1 if evaluation["is_correct"] else 0)
        type_reasoning = (
            (float(type_stats.get("reasoning_average", 0)) * (type_attempts - 1))
            + evaluation["reasoning_score"]
        ) / type_attempts
        by_type[scenario_type] = {
            "attempts": type_attempts,
            "correct": type_correct,
            "accuracy": round(type_correct / type_attempts, 3),
            "reasoning_average": round(type_reasoning, 3),
        }

        stats.update(
            {
                "attempts": attempts,
                "correct": correct,
                "accuracy": round(correct / attempts, 3),
                "streak": streak,
                "best_streak": max(int(stats.get("best_streak", 0)), streak),
                "reasoning_average": round(reasoning_average, 3),
                "by_type": by_type,
                "last_attempt_at": utcnow(),
            }
        )
        stats["achievements"] = self.achievements.evaluate(stats)
        stats["skill_score"] = self._skill_score(stats)
        return stats

    def _skill_score(self, stats: dict[str, Any]) -> int:
        accuracy = float(stats.get("accuracy", 0))
        reasoning = float(stats.get("reasoning_average", 0))
        streak_score = min(1.0, int(stats.get("best_streak", 0)) / 5)
        breadth = min(1.0, len(stats.get("by_type", {})) / 6)
        return round(((accuracy * 0.45) + (reasoning * 0.35) + (streak_score * 0.1) + (breadth * 0.1)) * 100)

    def _result_scenario(self, scenario: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": scenario["id"],
            "scenario_type": scenario["scenario_type"],
            "title": scenario["title"],
            "label": scenario["label"],
            "indicators": scenario.get("indicators", []),
            "explanation": scenario.get("explanation", ""),
        }
