import asyncio
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import get_settings
from app.infrastructure.db.mongo import MongoDatabase
from app.infrastructure.db.repositories import MongoScenarioRepository
from app.infrastructure.datasets.asset_manager import DatasetAssetManager
from app.infrastructure.scenario_plugins.dataset import DatasetManifestLoader

async def main():
    print("Initializing Database Seeding...")
    settings = get_settings()
    
    print(f"Connecting to MongoDB URI: {settings.mongodb_uri}")
    print(f"Target Database: {settings.mongodb_db}")
    
    mongo = MongoDatabase(settings)
    db = await mongo.connect()
    
    scenario_repo = MongoScenarioRepository(db)
    
    app_dir = backend_dir / "app"
    asset_manager = DatasetAssetManager(static_root=app_dir / "static")
    manifest_loader = DatasetManifestLoader(
        manifest_dir=app_dir / "infrastructure" / "datasets" / "manifests",
        asset_manager=asset_manager,
    )
    
    # Before seeding, count current documents
    count_before = await db.scenarios.count_documents({})
    print(f"Current scenario count in DB: {count_before}")
    
    print("Running seeding...")
    await manifest_loader.seed(scenario_repo)
    
    count_after = await db.scenarios.count_documents({})
    print(f"Scenario count after seeding: {count_after}")
    
    # Confirm detail counts per type
    types = ["text", "image", "audio", "video", "qr_code", "website"]
    print("Scenarios by type:")
    for t in types:
        cnt = await db.scenarios.count_documents({"scenario_type": t})
        print(f" - {t}: {cnt}")
        
    await mongo.close()
    print("Seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
