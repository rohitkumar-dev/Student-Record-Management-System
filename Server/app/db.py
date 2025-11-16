from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DATABASE_NAME]


users_collection = db["users"]
students_collection = db["students"]
otps_collection = db["otps"]
