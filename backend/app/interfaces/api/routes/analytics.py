from __future__ import annotations

from fastapi import APIRouter, Depends

from app.interfaces.api.deps import current_user, get_analytics_service
from app.schemas.analytics import DashboardOut, ProgressOut


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", response_model=DashboardOut)
async def dashboard(user=Depends(current_user), analytics_service=Depends(get_analytics_service)) -> DashboardOut:
    return DashboardOut(**await analytics_service.dashboard(user))


@router.get("/progress", response_model=ProgressOut)
async def progress(user=Depends(current_user), analytics_service=Depends(get_analytics_service)) -> ProgressOut:
    return ProgressOut(**await analytics_service.progress(user))


@router.get("/leaderboard")
async def leaderboard(analytics_service=Depends(get_analytics_service)) -> list[dict]:
    return await analytics_service.leaderboard()
