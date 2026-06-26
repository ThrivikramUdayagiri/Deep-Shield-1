import pytest

from app.infrastructure.ai.reasoning_evaluator import ReasoningEvaluator


@pytest.mark.asyncio
async def test_reasoning_evaluator_rewards_specific_evidence():
    evaluator = ReasoningEvaluator(model_name="unused", enable_embeddings=False)

    result = await evaluator.evaluate(
        "The message uses urgent pressure, a lookalike domain, and asks for credentials.",
        [
            "Creates urgent pressure to act quickly",
            "Uses a lookalike domain",
            "Requests credentials through an external site",
        ],
    )

    assert result["score"] >= 0.66
    assert "Uses a lookalike domain" in result["matched_indicators"]


@pytest.mark.asyncio
async def test_reasoning_evaluator_handles_empty_reasoning():
    evaluator = ReasoningEvaluator(model_name="unused", enable_embeddings=False)

    result = await evaluator.evaluate("", ["Unexpected payment request"])

    assert result["score"] == 0.0
    assert result["missed_indicators"] == ["Unexpected payment request"]
