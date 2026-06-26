from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class DashboardOut(BaseModel):
    stats: dict[str, Any]
    recent_attempts: list[dict[str, Any]]
    recommendations: list[dict[str, Any]]
    weaknesses: list[dict[str, Any]]


class ProgressOut(BaseModel):
    stats: dict[str, Any]
    history: list[dict[str, Any]]
    by_type: dict[str, Any]
