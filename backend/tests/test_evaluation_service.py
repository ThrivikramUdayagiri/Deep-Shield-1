import pytest

from app.application.evaluation_service import EvaluationService
from app.domain.enums import TruthLabel
from app.infrastructure.ai.reasoning_evaluator import ReasoningEvaluator


@pytest.mark.asyncio
async def test_evaluation_scores_answer_and_reasoning():
    service = EvaluationService(ReasoningEvaluator(model_name="unused", enable_embeddings=False))
    scenario = {
        "label": "fake",
        "indicators": [
            "Uses a lookalike domain",
            "Creates urgent pressure",
            "Requests payment details",
        ],
        "explanation": "Fake because the content combines a lookalike domain with urgency.",
    }

    result = await service.evaluate(
        scenario=scenario,
        selected_label=TruthLabel.FAKE,
        reasoning="It is fake because it uses a lookalike domain and urgent pressure.",
    )

    assert result["is_correct"] is True
    assert result["correct_label"] == "fake"
    assert result["overall_score"] > 0.8
