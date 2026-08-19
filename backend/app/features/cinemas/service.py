from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.exceptions import NotFoundError
from app.common.utils import to_object_id
from app.features.cinemas.models import cinema_public, screen_public


async def list_cinemas(db: AsyncIOMotorDatabase, city: Optional[str] = None) -> dict:
    query = {}
    if city:
        query["city"] = city
    items = []
    async for doc in db.cinemas.find(query).sort("name", 1):
        items.append(cinema_public(doc))
    return {"items": items}


# Curated, ordered — this is a merchandising decision, not something to derive
# from cinema counts. Cities outside this list are listed alphabetically after it.
POPULAR_CITIES = [
    "Mumbai",
    "Delhi-NCR",
    "Bengaluru",
    "Hyderabad",
    "Chandigarh",
    "Ahmedabad",
    "Pune",
    "Chennai",
    "Kolkata",
    "Kochi",
]


async def list_cities(db: AsyncIOMotorDatabase) -> dict:
    pipeline = [
        {"$group": {"_id": "$city", "cinema_count": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    rows = [doc async for doc in db.cinemas.aggregate(pipeline) if doc["_id"]]

    rank = {name: index for index, name in enumerate(POPULAR_CITIES)}
    rows.sort(key=lambda doc: (rank.get(doc["_id"], len(rank)), doc["_id"]))

    items = [
        {
            "name": doc["_id"],
            "cinema_count": doc["cinema_count"],
            "is_popular": doc["_id"] in rank,
        }
        for doc in rows
    ]
    return {"items": items}


async def get_cinema(db: AsyncIOMotorDatabase, cinema_id: str) -> dict:
    doc = await db.cinemas.find_one({"_id": to_object_id(cinema_id)})
    if doc is None:
        raise NotFoundError("Cinema not found")
    screens = [
        screen_public(screen)
        async for screen in db.screens.find({"cinema_id": doc["_id"]}).sort("name", 1)
    ]
    return cinema_public(doc, screens)
