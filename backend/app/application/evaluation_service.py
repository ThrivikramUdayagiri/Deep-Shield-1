from __future__ import annotations

from typing import Any

from app.domain.enums import TruthLabel
from app.infrastructure.ai.verification_models import VerificationInput
from app.infrastructure.ai.reasoning_evaluator import ReasoningEvaluator
from app.application.comparison_engine import DualAIVerificationEngine


class EvaluationService:
    def __init__(self, evaluator: ReasoningEvaluator | DualAIVerificationEngine):
        self.evaluator = evaluator

    async def evaluate(
        self,
        *,
        scenario: dict[str, Any],
        selected_label: TruthLabel,
        reasoning: str,
    ) -> dict[str, Any]:
        correct_label = TruthLabel(scenario["label"])
        is_correct = selected_label == correct_label
        indicators = scenario.get("indicators", [])

        if hasattr(self.evaluator, "verify"):
            verification = await self.evaluator.verify(
                VerificationInput(
                    scenario_id=scenario["id"],
                    scenario_type=scenario["scenario_type"],
                    title=scenario["title"],
                    content=scenario.get("content", {}),
                    correct_label=correct_label.value,
                    selected_label=selected_label.value,
                    reasoning=reasoning,
                    indicators=indicators,
                    explanation=scenario.get("explanation", ""),
                )
            )
            answer_score = 1.0 if is_correct else 0.0
            overall_score = round((answer_score * 0.6) + (verification["reasoning_score"] * 0.4), 2)
            final_report = verification["final_report"]
            return {
                "is_correct": is_correct,
                "correct_label": correct_label.value,
                "selected_label": selected_label.value,
                "reasoning_score": verification["reasoning_score"],
                "overall_score": overall_score,
                "feedback": final_report["educational_explanation"],
                "matched_indicators": [],
                "missed_indicators": final_report["missed_indicators"],
                "indicators": indicators,
                "explanation": scenario.get("explanation", ""),
                "gemini_analysis": verification["gemini_analysis"],
                "huggingface_analysis": verification["huggingface_analysis"],
                "final_report": final_report,
            }

        reasoning_result = await self.evaluator.evaluate(reasoning, indicators)
        answer_score = 1.0 if is_correct else 0.0
        overall_score = round((answer_score * 0.65) + (reasoning_result["score"] * 0.35), 2)
        return {
            "is_correct": is_correct,
            "correct_label": correct_label.value,
            "selected_label": selected_label.value,
            "reasoning_score": reasoning_result["score"],
            "overall_score": overall_score,
            "feedback": reasoning_result["feedback"],
            "matched_indicators": reasoning_result["matched_indicators"],
            "missed_indicators": reasoning_result["missed_indicators"],
            "indicators": scenario.get("indicators", []),
            "explanation": scenario.get("explanation", ""),
            "gemini_analysis": None,
            "huggingface_analysis": None,
            "final_report": {
                "final_verdict": correct_label.value,
                "confidence": overall_score,
                "models_agree": True,
                "stronger_provider": "local",
                "disagreement_summary": "Local fallback evaluator was used.",
                "educational_explanation": scenario.get("explanation", ""),
                "missed_indicators": reasoning_result["missed_indicators"],
                "improvement_tips": [reasoning_result["feedback"]],
                "confidence_scores": {"gemini": 0.0, "huggingface": 0.0, "combined": overall_score},
            },
        }
