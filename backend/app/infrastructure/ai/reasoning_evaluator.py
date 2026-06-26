from __future__ import annotations

import asyncio
import math
import re
from typing import Any


STOPWORDS = {
    "about",
    "after",
    "also",
    "because",
    "from",
    "have",
    "into",
    "that",
    "their",
    "there",
    "this",
    "with",
    "would",
    "your",
}


class ReasoningEvaluator:
    def __init__(self, *, model_name: str, enable_embeddings: bool = False):
        self.model_name = model_name
        self.enable_embeddings = enable_embeddings
        self._model: Any | None = None

    async def evaluate(self, reasoning: str, indicators: list[str]) -> dict[str, Any]:
        reasoning = reasoning.strip()
        if not reasoning:
            return {
                "score": 0.0,
                "matched_indicators": [],
                "missed_indicators": indicators,
                "feedback": "Add concrete evidence from the content, not just a label.",
            }
        if self.enable_embeddings:
            try:
                return await asyncio.to_thread(self._embedding_score, reasoning, indicators)
            except Exception:
                pass
        return self._keyword_score(reasoning, indicators)

    def _keyword_score(self, reasoning: str, indicators: list[str]) -> dict[str, Any]:
        reasoning_tokens = set(self._tokens(reasoning))
        matched: list[str] = []
        for indicator in indicators:
            indicator_tokens = set(self._tokens(indicator))
            if not indicator_tokens:
                continue
            overlap = len(reasoning_tokens & indicator_tokens) / max(len(indicator_tokens), 1)
            if overlap >= 0.25 or any(token in reasoning.lower() for token in indicator_tokens):
                matched.append(indicator)

        score = min(1.0, len(matched) / max(3, min(len(indicators), 4)))
        missed = [indicator for indicator in indicators if indicator not in matched]
        feedback = self._feedback(score, matched)
        return {
            "score": round(score, 2),
            "matched_indicators": matched,
            "missed_indicators": missed,
            "feedback": feedback,
        }

    def _embedding_score(self, reasoning: str, indicators: list[str]) -> dict[str, Any]:
        model = self._get_embedding_model()
        sentences = [reasoning, *indicators]
        embeddings = model.encode(sentences, normalize_embeddings=True)
        reasoning_embedding = embeddings[0]
        matched: list[str] = []
        for indicator, embedding in zip(indicators, embeddings[1:]):
            similarity = float(sum(a * b for a, b in zip(reasoning_embedding, embedding)))
            if similarity >= 0.38:
                matched.append(indicator)
        score = min(1.0, math.sqrt(len(matched) / max(1, len(indicators))))
        return {
            "score": round(score, 2),
            "matched_indicators": matched,
            "missed_indicators": [indicator for indicator in indicators if indicator not in matched],
            "feedback": self._feedback(score, matched),
        }

    def _get_embedding_model(self) -> Any:
        if self._model is None:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.model_name)
        return self._model

    def _tokens(self, value: str) -> list[str]:
        return [
            token
            for token in re.findall(r"[a-z0-9]+", value.lower())
            if len(token) > 3 and token not in STOPWORDS
        ]

    def _feedback(self, score: float, matched: list[str]) -> str:
        if score >= 0.8:
            return "Strong reasoning. You cited multiple concrete trust indicators."
        if score >= 0.45:
            return "Good start. Add one or two more specific indicators from the content."
        if matched:
            return "You found a clue, but the explanation needs more evidence."
        return "The reasoning is too general. Point to sender, context, media artifacts, links, or requested actions."
