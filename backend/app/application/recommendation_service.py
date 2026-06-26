from __future__ import annotations

from typing import Any


class RecommendationService:
    def recommendations(self, stats: dict[str, Any]) -> list[dict[str, str]]:
        by_type = stats.get("by_type", {})
        recs: list[dict[str, str]] = []
        weak_types = sorted(
            by_type.items(),
            key=lambda item: item[1].get("accuracy", 1.0),
        )
        for scenario_type, values in weak_types[:3]:
            attempts = values.get("attempts", 0)
            accuracy = values.get("accuracy", 0)
            if attempts and accuracy < 0.75:
                recs.append(
                    {
                        "title": f"Drill {scenario_type.replace('_', ' ')} indicators",
                        "reason": f"Current accuracy is {round(accuracy * 100)}% across {attempts} attempts.",
                        "action": "Start weakness drill",
                        "scenario_type": scenario_type,
                    }
                )

        if stats.get("reasoning_average", 0) < 0.55 and stats.get("attempts", 0) > 0:
            recs.append(
                {
                    "title": "Strengthen explanations",
                    "reason": "Reasoning scores improve when you cite concrete evidence from the content.",
                    "action": "Practice evidence-first answers",
                    "scenario_type": "text",
                }
            )

        if not recs:
            recs.append(
                {
                    "title": "Try multimodal practice",
                    "reason": "Your recent performance is balanced. Add more content types to keep skills broad.",
                    "action": "Start multimodal mode",
                    "scenario_type": "multimodal",
                }
            )
        return recs[:4]
