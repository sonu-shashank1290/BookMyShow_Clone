from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.common.seed import seed_if_empty
from app.core.config import settings

client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri)
    try:
        await client.admin.command("ping")
        await ensure_indexes()
        await seed_if_empty(get_database())
    except Exception:
        # Server still starts; /health reports mongo as down until it is reachable.
        pass


async def close_db() -> None:
    global client
    if client is not None:
        client.close()
        client = None


def get_database() -> AsyncIOMotorDatabase:
    if client is None:
        raise RuntimeError("MongoDB is not connected")
    return client[settings.mongodb_db]


async def ensure_indexes() -> None:
    """Indexes that keep shows unique per screen + date + time."""
    db = get_database()
    await db.users.create_index("email", unique=True)
    await db.shows.create_index(
        [("screen_id", 1), ("date", 1), ("start_time", 1)],
        unique=True,
    )
    await db.shows.create_index([("movie_id", 1), ("cinema_id", 1), ("date", 1)])
    await db.cinemas.create_index("city")
    await db.movies.create_index("language")
    await db.movies.create_index("genre")
