from __future__ import annotations

from typing import Any

from app.application.recommendation_service import RecommendationService
from app.domain.repositories import AttemptRepository, ScenarioRepository, UserRepository


class AnalyticsService:
    def __init__(
        self,
        *,
        users: UserRepository,
        attempts: AttemptRepository,
        scenarios: ScenarioRepository,
        recommendations: RecommendationService,
    ):
        self.users = users
        self.attempts = attempts
        self.scenarios = scenarios
        self.recommendations = recommendations

    async def dashboard(self, user: dict[str, Any]) -> dict[str, Any]:
        stats = user.get("stats", {})
        recent = await self.attempts.recent_for_user(user["id"], limit=8)
        return {
            "stats": stats,
            "recent_attempts": recent,
            "recommendations": self.recommendations.recommendations(stats),
            "weaknesses": self.weaknesses(stats),
        }

    async def progress(self, user: dict[str, Any]) -> dict[str, Any]:
        history = await self.attempts.history_for_user(user["id"], limit=80)
        return {
            "stats": user.get("stats", {}),
            "history": history,
            "by_type": user.get("stats", {}).get("by_type", {}),
        }

    def weaknesses(self, stats: dict[str, Any]) -> list[dict[str, Any]]:
        rows = []
        for scenario_type, values in stats.get("by_type", {}).items():
            attempts = values.get("attempts", 0)
            if attempts == 0:
                continue
            accuracy = values.get("accuracy", 0)
            reasoning = values.get("reasoning_average", 0)
            risk = round((1 - accuracy) * 0.7 + (1 - reasoning) * 0.3, 3)
            rows.append(
                {
                    "scenario_type": scenario_type,
                    "accuracy": accuracy,
                    "reasoning_average": reasoning,
                    "attempts": attempts,
                    "risk": risk,
                }
            )
        return sorted(rows, key=lambda item: item["risk"], reverse=True)

    async def leaderboard(self) -> list[dict[str, Any]]:
        rows = await self.attempts.leaderboard(limit=20)
        leaderboard = []
        for index, row in enumerate(rows, start=1):
            user = await self.users.get_by_id(row["_id"])
            leaderboard.append(
                {
                    "rank": index,
                    "user_id": row["_id"],
                    "full_name": user["full_name"] if user else "Unknown learner",
                    "attempts": row["attempts"],
                    "correct": row["correct"],
                    "accuracy": round(row.get("accuracy", 0), 3),
                    "reasoning_average": round(row.get("reasoning_average", 0), 3),
                    "last_attempt_at": row.get("last_attempt_at"),
                }
            )
        return leaderboard

    async def admin_monitoring(self) -> dict[str, Any]:
        return {
            "user_count": await self.users.count(),
            "attempt_count": await self.attempts.count(),
            "attempts_today": await self.attempts.count_today(),
            "scenario_counts": await self.scenarios.count_by_type(),
            "leaderboard": await self.leaderboard(),
        }
