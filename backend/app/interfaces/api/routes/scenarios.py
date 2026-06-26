from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.domain.enums import ScenarioType, TrainingMode
from app.interfaces.api.deps import current_user, get_scenario_service
from app.schemas.scenario import AttemptResult, ScenarioOut, SubmitAttemptRequest


router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("/modes")
async def modes() -> list[dict[str, str]]:
    return [
        {"id": TrainingMode.QUICK.value, "title": "Quick Mix", "description": "A short mix across all available scenario types."},
        {"id": TrainingMode.TEXT_ONLY.value, "title": "Text Signals", "description": "Generated messages, posts, and emails from local open-source models."},
        {"id": TrainingMode.MULTIMODAL.value, "title": "Multimodal Lab", "description": "Images, audio, video, QR, and website evidence from managed datasets."},
        {"id": TrainingMode.WEAKNESS_DRILL.value, "title": "Weakness Drill", "description": "Personalized practice based on your lowest scoring content type."},
        {"id": TrainingMode.ADVANCED.value, "title": "Advanced Review", "description": "Harder scenarios with subtle manipulation patterns."},
    ]


@router.get("/next", response_model=ScenarioOut)
async def next_scenario(
    mode: TrainingMode = Query(default=TrainingMode.QUICK),
    scenario_type: ScenarioType | None = Query(default=None),
    user=Depends(current_user),
    scenario_service=Depends(get_scenario_service),
) -> ScenarioOut:
    try:
        scenario = await scenario_service.next_scenario(user=user, mode=mode, scenario_type=scenario_type)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return ScenarioOut(**scenario)


@router.post("/attempts", response_model=AttemptResult)
async def submit_attempt(
    payload: SubmitAttemptRequest,
    user=Depends(current_user),
    scenario_service=Depends(get_scenario_service),
) -> AttemptResult:
    try:
        return AttemptResult(
            **await scenario_service.submit_attempt(
                user=user,
                scenario_id=payload.scenario_id,
                selected_label=payload.selected_label,
                reasoning=payload.reasoning,
            )
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
