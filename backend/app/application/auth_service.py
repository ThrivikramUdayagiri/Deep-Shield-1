from __future__ import annotations

from typing import Any

from pymongo.errors import DuplicateKeyError

from app.core.config import Settings
from app.core.security import create_access_token, hash_password, verify_password
from app.domain.enums import UserRole
from app.domain.repositories import UserRepository


class AuthService:
    def __init__(self, *, users: UserRepository, settings: Settings):
        self.users = users
        self.settings = settings

    async def register(self, *, email: str, password: str, full_name: str) -> dict[str, Any]:
        try:
            return await self.users.create_user(
                email=email,
                password_hash=hash_password(password),
                full_name=full_name,
                role=UserRole.LEARNER,
            )
        except DuplicateKeyError as exc:
            raise ValueError("Email is already registered") from exc

    async def authenticate(self, *, email: str, password: str) -> dict[str, Any] | None:
        user = await self.users.get_by_email(email)
        if user is None or not verify_password(password, user["password_hash"]):
            return None
        mark_login = getattr(self.users, "mark_login", None)
        if mark_login:
            await mark_login(user["id"])
        return user

    def token_for(self, user: dict[str, Any]) -> str:
        return create_access_token(
            subject=user["id"],
            settings=self.settings,
            claims={"role": user["role"], "email": user["email"]},
        )

    async def ensure_admin(self) -> None:
        existing = await self.users.get_by_email(self.settings.admin_email)
        if existing:
            return
        await self.users.create_user(
            email=self.settings.admin_email,
            password_hash=hash_password(self.settings.admin_password),
            full_name=self.settings.admin_name,
            role=UserRole.ADMIN,
        )
