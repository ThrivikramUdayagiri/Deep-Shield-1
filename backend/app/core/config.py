from __future__ import annotations

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "DeepShield AI"
    environment: str = "development"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "deepshield"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:8080",
        ]
    )

    enable_llm_generation: bool = True
    text_model_name: str = "google/flan-t5-small"
    reasoning_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    enable_embedding_reasoning: bool = False
    gemini_api_key: str | None = None
    gemini_model_name: str = "gemini-2.5-flash"
    hf_token: str | None = None
    hf_model_name: str = "Qwen/Qwen2.5-7B-Instruct-1M"
    hf_router_url: str = "https://router.huggingface.co/v1"
    ai_request_timeout_seconds: float = 30.0
    dataset_auto_download: bool = False

    admin_email: str = "admin@deepshield.local"
    admin_password: str = "AdminPass123!"
    admin_name: str = "DeepShield Admin"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
