from __future__ import annotations

import json
import re
from typing import Any, Protocol

import httpx

from app.infrastructure.ai.verification_models import ProviderAnalysis, VerificationInput


class VerificationProvider(Protocol):
    provider_name: str
    model_name: str

    async def analyze(self, payload: VerificationInput) -> ProviderAnalysis:
        ...


SYSTEM_PROMPT = """You are a digital trust trainer. Evaluate a learner's Fake/Genuine decision.
Return JSON only with this schema:
{
  "verdict": "fake|genuine|uncertain",
  "confidence": 0.0,
  "is_user_correct": true,
  "reasoning_score": 0.0,
  "analysis": "brief educational analysis",
  "evidence": ["specific evidence from the content"],
  "missed_indicators": ["important indicators the user missed"],
  "improvement_tips": ["short actionable training tips"]
}
Use the ground truth label and known indicators as the grading reference. Reward reasoning that cites concrete evidence.
"""


def _clamp(value: Any, default: float = 0.5) -> float:
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    return max(0.0, min(1.0, parsed))


def _as_list(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()]
    if isinstance(value, str):
        return [value] if value.strip() else []
    return [str(value)]


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def _normalize_response(
    *,
    provider: str,
    model: str,
    payload: VerificationInput,
    data: dict[str, Any],
    status: str = "ok",
    error: str | None = None,
) -> ProviderAnalysis:
    verdict = str(data.get("verdict") or payload.correct_label).lower()
    if verdict not in {"fake", "genuine", "uncertain"}:
        verdict = "uncertain"
    is_user_correct = bool(data.get("is_user_correct", payload.selected_label == payload.correct_label))
    evidence = _as_list(data.get("evidence"))
    missed = _as_list(data.get("missed_indicators"))
    tips = _as_list(data.get("improvement_tips"))
    return ProviderAnalysis(
        provider=provider,
        model=model,
        verdict=verdict,
        confidence=_clamp(data.get("confidence"), 0.55 if status == "ok" else 0.35),
        is_user_correct=is_user_correct,
        reasoning_score=_clamp(data.get("reasoning_score"), _local_reasoning_score(payload.reasoning, payload.indicators)),
        analysis=str(data.get("analysis") or _local_analysis(payload)),
        evidence=evidence or _local_evidence(payload),
        missed_indicators=missed or _local_missed(payload),
        improvement_tips=tips or _local_tips(payload),
        status=status,
        error=error,
    )


def _local_reasoning_score(reasoning: str, indicators: list[str]) -> float:
    tokens = set(re.findall(r"[a-z0-9]{4,}", reasoning.lower()))
    matched = 0
    for indicator in indicators:
        indicator_tokens = set(re.findall(r"[a-z0-9]{4,}", indicator.lower()))
        if indicator_tokens and len(tokens & indicator_tokens) / len(indicator_tokens) >= 0.25:
            matched += 1
    return round(min(1.0, matched / max(3, min(len(indicators), 4))), 2)


def _local_evidence(payload: VerificationInput) -> list[str]:
    score_tokens = set(re.findall(r"[a-z0-9]{4,}", payload.reasoning.lower()))
    matched = []
    for indicator in payload.indicators:
        indicator_tokens = set(re.findall(r"[a-z0-9]{4,}", indicator.lower()))
        if indicator_tokens and score_tokens & indicator_tokens:
            matched.append(indicator)
    return matched[:4] or payload.indicators[:2]


def _local_missed(payload: VerificationInput) -> list[str]:
    evidence = set(_local_evidence(payload))
    return [indicator for indicator in payload.indicators if indicator not in evidence][:4]


def _local_tips(payload: VerificationInput) -> list[str]:
    if payload.selected_label != payload.correct_label:
        return [
            "Separate how polished the content looks from what action it asks you to take.",
            "Verify sender, domain, channel, and requested action before deciding.",
        ]
    if _local_reasoning_score(payload.reasoning, payload.indicators) < 0.6:
        return ["Name at least two concrete clues from the content in your explanation."]
    return ["Keep citing specific evidence; that is the habit that transfers to real incidents."]


def _local_analysis(payload: VerificationInput) -> str:
    outcome = "matches" if payload.selected_label == payload.correct_label else "does not match"
    return (
        f"The user's answer {outcome} the scenario label. The strongest clues are: "
        f"{'; '.join(payload.indicators[:3])}."
    )


def _fallback_analysis(
    *,
    provider: str,
    model: str,
    payload: VerificationInput,
    status: str,
    error: str | None,
) -> ProviderAnalysis:
    return _normalize_response(
        provider=provider,
        model=model,
        payload=payload,
        data={
            "verdict": payload.correct_label,
            "confidence": 0.35,
            "is_user_correct": payload.selected_label == payload.correct_label,
            "reasoning_score": _local_reasoning_score(payload.reasoning, payload.indicators),
            "analysis": _local_analysis(payload),
            "evidence": _local_evidence(payload),
            "missed_indicators": _local_missed(payload),
            "improvement_tips": _local_tips(payload),
        },
        status=status,
        error=error,
    )


class GeminiVerificationProvider:
    provider_name = "gemini"

    def __init__(self, *, api_key: str | None, model_name: str, timeout_seconds: float = 25.0):
        self.api_key = api_key
        self.model_name = model_name
        self.timeout_seconds = timeout_seconds

    async def analyze(self, payload: VerificationInput) -> ProviderAnalysis:
        if not self.api_key:
            return _fallback_analysis(
                provider=self.provider_name,
                model=self.model_name,
                payload=payload,
                status="missing_credentials",
                error="GEMINI_API_KEY is not set",
            )
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent"
        body = {
            "contents": [{"parts": [{"text": f"{SYSTEM_PROMPT}\n\n{payload.prompt_context()}"}]}],
            "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    url,
                    headers={"x-goog-api-key": self.api_key, "Content-Type": "application/json"},
                    json=body,
                )
                response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return _normalize_response(
                provider=self.provider_name,
                model=self.model_name,
                payload=payload,
                data=_extract_json(text),
            )
        except Exception as exc:
            return _fallback_analysis(
                provider=self.provider_name,
                model=self.model_name,
                payload=payload,
                status="fallback",
                error=str(exc),
            )


class HuggingFaceVerificationProvider:
    provider_name = "huggingface"

    def __init__(
        self,
        *,
        token: str | None,
        model_name: str,
        router_url: str = "https://router.huggingface.co/v1",
        timeout_seconds: float = 35.0,
    ):
        self.token = token
        self.model_name = model_name
        self.router_url = router_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    async def analyze(self, payload: VerificationInput) -> ProviderAnalysis:
        if not self.token:
            return _fallback_analysis(
                provider=self.provider_name,
                model=self.model_name,
                payload=payload,
                status="missing_credentials",
                error="HF_TOKEN is not set",
            )
        body = {
            "model": self.model_name,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": payload.prompt_context()},
            ],
            "temperature": 0.1,
            "max_tokens": 750,
            "response_format": {"type": "json_object"},
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.router_url}/chat/completions",
                    headers={"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"},
                    json=body,
                )
                response.raise_for_status()
            data = response.json()
            text = data["choices"][0]["message"]["content"]
            return _normalize_response(
                provider=self.provider_name,
                model=self.model_name,
                payload=payload,
                data=_extract_json(text),
            )
        except Exception as exc:
            return _fallback_analysis(
                provider=self.provider_name,
                model=self.model_name,
                payload=payload,
                status="fallback",
                error=str(exc),
            )
