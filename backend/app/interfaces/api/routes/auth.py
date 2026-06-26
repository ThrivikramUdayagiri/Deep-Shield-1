from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.interfaces.api.deps import current_user, get_auth_service
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, auth_service=Depends(get_auth_service)) -> TokenResponse:
    try:
        user = await auth_service.register(
            email=str(payload.email),
            password=payload.password,
            full_name=payload.full_name,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return TokenResponse(access_token=auth_service.token_for(user), user=UserOut(**user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, auth_service=Depends(get_auth_service)) -> TokenResponse:
    user = await auth_service.authenticate(email=str(payload.email), password=payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return TokenResponse(access_token=auth_service.token_for(user), user=UserOut(**user))


@router.get("/me", response_model=UserOut)
async def me(user=Depends(current_user)) -> UserOut:
    return UserOut(**user)
