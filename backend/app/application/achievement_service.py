from __future__ import annotations

from typing import Any


ACHIEVEMENTS = {
    "first_signal": {
        "title": "First Signal",
        "description": "Completed the first trust challenge.",
    },
    "five_correct": {
        "title": "Pattern Spotter",
        "description": "Identified five scenarios correctly.",
    },
    "streak_three": {
        "title": "Steady Eye",
        "description": "Built a three-answer correct streak.",
    },
    "reasoning_detective": {
        "title": "Reasoning Detective",
        "description": "Reached an 80% reasoning average.",
    },
    "multimodal_explorer": {
        "title": "Multimodal Explorer",
        "description": "Practiced at least three content types.",
    },
}


class AchievementService:
    def evaluate(self, stats: dict[str, Any]) -> list[dict[str, str]]:
        earned = {achievement["id"] for achievement in stats.get("achievements", [])}
        by_type = stats.get("by_type", {})
        checks = {
            "first_signal": stats.get("attempts", 0) >= 1,
            "five_correct": stats.get("correct", 0) >= 5,
            "streak_three": stats.get("best_streak", 0) >= 3,
            "reasoning_detective": stats.get("reasoning_average", 0) >= 0.8 and stats.get("attempts", 0) >= 3,
            "multimodal_explorer": len([item for item in by_type.values() if item.get("attempts", 0) > 0]) >= 3,
        }
        updated = list(stats.get("achievements", []))
        for achievement_id, passed in checks.items():
            if passed and achievement_id not in earned:
                updated.append({"id": achievement_id, **ACHIEVEMENTS[achievement_id]})
        return updated
