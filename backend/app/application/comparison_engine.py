from __future__ import annotations

import asyncio
from typing import Any, Protocol

from app.infrastructure.ai.verification_models import ProviderAnalysis, VerificationInput


class VerificationProvider(Protocol):
    provider_name: str
    model_name: str

    async def analyze(self, payload: VerificationInput) -> ProviderAnalysis:
        ...


class ComparisonEngine:
    def merge(
        self,
        *,
        payload: VerificationInput,
        gemini: ProviderAnalysis,
        huggingface: ProviderAnalysis,
    ) -> dict[str, Any]:
        analyses = [gemini, huggingface]
        agreement = gemini.verdict == huggingface.verdict
        stronger = self._stronger_analysis(payload, analyses)
        confidence = self._combined_confidence(payload, analyses, agreement)
        missed = self._unique([item for analysis in analyses for item in analysis.missed_indicators])
        tips = self._unique([item for analysis in analyses for item in analysis.improvement_tips])
        if not agreement:
            disagreement_summary = (
                f"The models disagreed: Gemini judged this as {gemini.verdict}; Hugging Face judged it as {huggingface.verdict}. "
                f"The stronger evidence comes from {stronger.provider} because it aligns with more known indicators."
            )
        else:
            disagreement_summary = "Both models reached the same verdict and focused on similar evidence."

        return {
            "final_verdict": payload.correct_label,
            "confidence": confidence,
            "models_agree": agreement,
            "stronger_provider": stronger.provider,
            "disagreement_summary": disagreement_summary,
            "educational_explanation": self._educational_explanation(payload, stronger, agreement),
            "missed_indicators": missed or payload.indicators,
            "improvement_tips": tips[:5],
            "confidence_scores": {
                "gemini": gemini.confidence,
                "huggingface": huggingface.confidence,
                "combined": confidence,
            },
        }

    def _combined_confidence(
        self,
        payload: VerificationInput,
        analyses: list[ProviderAnalysis],
        agreement: bool,
    ) -> float:
        weighted = (analyses[0].confidence * 0.6) + (analyses[1].confidence * 0.4)
        aligned = sum(1 for analysis in analyses if analysis.verdict == payload.correct_label)
        if agreement:
            weighted += 0.08
        elif aligned == 1:
            weighted -= 0.08
        return round(max(0.0, min(1.0, weighted)), 2)

    def _stronger_analysis(
        self,
        payload: VerificationInput,
        analyses: list[ProviderAnalysis],
    ) -> ProviderAnalysis:
        return max(
            analyses,
            key=lambda analysis: (
                self._indicator_alignment(payload.indicators, analysis.evidence),
                analysis.confidence,
                analysis.reasoning_score,
            ),
        )

    def _indicator_alignment(self, indicators: list[str], evidence: list[str]) -> int:
        joined = " ".join(evidence).lower()
        score = 0
        for indicator in indicators:
            indicator_tokens = {token for token in indicator.lower().split() if len(token) > 3}
            if indicator_tokens and any(token in joined for token in indicator_tokens):
                score += 1
        return score

    def _educational_explanation(
        self,
        payload: VerificationInput,
        stronger: ProviderAnalysis,
        agreement: bool,
    ) -> str:
        verdict_text = f"The final training verdict is {payload.correct_label.upper()}."
        evidence = "; ".join(stronger.evidence[:3] or payload.indicators[:3])
        if agreement:
            return f"{verdict_text} Both engines support this decision. Strongest evidence: {evidence}."
        return (
            f"{verdict_text} The engines disagreed, so the report weighs evidence quality instead of blindly voting. "
            f"The stronger evidence is: {evidence}."
        )

    def _unique(self, values: list[str]) -> list[str]:
        seen: set[str] = set()
        unique: list[str] = []
        for value in values:
            normalized = value.strip()
            key = normalized.lower()
            if normalized and key not in seen:
                unique.append(normalized)
                seen.add(key)
        return unique


class DualAIVerificationEngine:
    def __init__(
        self,
        *,
        gemini_provider: VerificationProvider,
        huggingface_provider: VerificationProvider,
        comparison_engine: ComparisonEngine,
    ):
        self.gemini_provider = gemini_provider
        self.huggingface_provider = huggingface_provider
        self.comparison_engine = comparison_engine

    async def verify(self, payload: VerificationInput) -> dict[str, Any]:
        gemini, huggingface = await asyncio.gather(
            self.gemini_provider.analyze(payload),
            self.huggingface_provider.analyze(payload),
        )
        final_report = self.comparison_engine.merge(
            payload=payload,
            gemini=gemini,
            huggingface=huggingface,
        )
        reasoning_score = round((gemini.reasoning_score * 0.55) + (huggingface.reasoning_score * 0.45), 2)
        return {
            "gemini_analysis": gemini.to_dict(),
            "huggingface_analysis": huggingface.to_dict(),
            "final_report": final_report,
            "reasoning_score": reasoning_score,
        }
