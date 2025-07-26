from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from backend.app.models.models import document_models
from backend.app.core.config import settings
client = AsyncIOMotorClient(settings.DATABASE_URL.strip())
async def init_db():
    await init_beanie(database=client.get_database(), document_models=document_models)
