from __future__ import annotations

from fastapi import APIRouter, Depends

from app.interfaces.api.deps import admin_user, get_analytics_service


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/monitoring")
async def monitoring(_user=Depends(admin_user), analytics_service=Depends(get_analytics_service)) -> dict:
    return await analytics_service.admin_monitoring()
