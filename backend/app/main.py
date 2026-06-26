from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.application.achievement_service import AchievementService
from app.application.analytics_service import AnalyticsService
from app.application.auth_service import AuthService
from app.application.comparison_engine import ComparisonEngine, DualAIVerificationEngine
from app.application.evaluation_service import EvaluationService
from app.application.recommendation_service import RecommendationService
from app.application.scenario_service import ScenarioService
from app.core.config import get_settings
from app.domain.enums import ScenarioType
from app.infrastructure.ai.text_generator import OpenSourceTextGenerator
from app.infrastructure.ai.verification_providers import GeminiVerificationProvider, HuggingFaceVerificationProvider
from app.infrastructure.datasets.asset_manager import DatasetAssetManager
from app.infrastructure.db.mongo import MongoDatabase
from app.infrastructure.db.repositories import MongoAttemptRepository, MongoScenarioRepository, MongoUserRepository
from app.infrastructure.scenario_plugins.dataset import DatasetManifestLoader, DatasetScenarioPlugin
from app.infrastructure.scenario_plugins.registry import ScenarioPluginRegistry
from app.infrastructure.scenario_plugins.text_llm import TextLLMScenarioPlugin
from app.interfaces.api.routes import admin, analytics, auth, scenarios


APP_DIR = Path(__file__).resolve().parent


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    mongo = MongoDatabase(settings)
    database = await mongo.connect()

    users = MongoUserRepository(database)
    scenario_repo = MongoScenarioRepository(database)
    attempt_repo = MongoAttemptRepository(database)

    asset_manager = DatasetAssetManager(static_root=APP_DIR / "static")
    manifest_loader = DatasetManifestLoader(
        manifest_dir=APP_DIR / "infrastructure" / "datasets" / "manifests",
        asset_manager=asset_manager,
    )
    await manifest_loader.seed(scenario_repo)

    registry = ScenarioPluginRegistry()
    registry.register(
        TextLLMScenarioPlugin(
            repository=scenario_repo,
            generator=OpenSourceTextGenerator(
                model_name=settings.text_model_name,
                enabled=settings.enable_llm_generation,
            ),
        )
    )
    for scenario_type in [
        ScenarioType.IMAGE,
        ScenarioType.AUDIO,
        ScenarioType.VIDEO,
        ScenarioType.QR_CODE,
        ScenarioType.WEBSITE,
    ]:
        registry.register(
            DatasetScenarioPlugin(
                scenario_type=scenario_type,
                repository=scenario_repo,
                loader=manifest_loader,
            )
        )

    auth_service = AuthService(users=users, settings=settings)
    await auth_service.ensure_admin()

    verification_engine = DualAIVerificationEngine(
        gemini_provider=GeminiVerificationProvider(
            api_key=settings.gemini_api_key,
            model_name=settings.gemini_model_name,
            timeout_seconds=settings.ai_request_timeout_seconds,
        ),
        huggingface_provider=HuggingFaceVerificationProvider(
            token=settings.hf_token,
            model_name=settings.hf_model_name,
            router_url=settings.hf_router_url,
            timeout_seconds=settings.ai_request_timeout_seconds,
        ),
        comparison_engine=ComparisonEngine(),
    )
    evaluator = EvaluationService(verification_engine)
    recommendation_service = RecommendationService()
    achievement_service = AchievementService()

    app.state.settings = settings
    app.state.mongo = mongo
    app.state.user_repository = users
    app.state.scenario_repository = scenario_repo
    app.state.attempt_repository = attempt_repo
    app.state.auth_service = auth_service
    app.state.scenario_service = ScenarioService(
        users=users,
        scenarios=scenario_repo,
        attempts=attempt_repo,
        registry=registry,
        evaluator=evaluator,
        achievements=achievement_service,
    )
    app.state.analytics_service = AnalyticsService(
        users=users,
        attempts=attempt_repo,
        scenarios=scenario_repo,
        recommendations=recommendation_service,
    )

    yield
    await mongo.close()


app = FastAPI(title="DeepShield AI", version="0.1.0", lifespan=lifespan)
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory=APP_DIR / "static"), name="static")
app.include_router(auth.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "deepshield-ai"}
