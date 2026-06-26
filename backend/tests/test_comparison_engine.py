from app.application.comparison_engine import ComparisonEngine
from app.infrastructure.ai.verification_models import ProviderAnalysis, VerificationInput


def test_comparison_engine_explains_model_disagreement():
    payload = VerificationInput(
        scenario_id="scenario-1",
        scenario_type="text",
        title="Tricky fake chat",
        content={"body": "Send me the one-time code in chat."},
        correct_label="fake",
        selected_label="genuine",
        reasoning="It is from a known colleague.",
        indicators=["Asks for a one-time code", "Uses a familiar identity", "External migration link"],
        explanation="One-time codes should never be shared in chat.",
    )
    gemini = ProviderAnalysis(
        provider="gemini",
        model="gemini-test",
        verdict="fake",
        confidence=0.88,
        is_user_correct=False,
        reasoning_score=0.4,
        analysis="The code request is the decisive clue.",
        evidence=["Asks for a one-time code", "External migration link"],
        missed_indicators=["External migration link"],
        improvement_tips=["Do not share one-time codes."],
    )
    hf = ProviderAnalysis(
        provider="huggingface",
        model="qwen-test",
        verdict="genuine",
        confidence=0.61,
        is_user_correct=True,
        reasoning_score=0.25,
        analysis="The sender appears familiar.",
        evidence=["Uses a familiar identity"],
        missed_indicators=["Asks for a one-time code"],
        improvement_tips=["Verify the requested action."],
    )

    report = ComparisonEngine().merge(payload=payload, gemini=gemini, huggingface=hf)

    assert report["final_verdict"] == "fake"
    assert report["models_agree"] is False
    assert report["stronger_provider"] == "gemini"
    assert "disagreed" in report["disagreement_summary"]
