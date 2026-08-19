from collections import defaultdict
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.exceptions import NotFoundError
from app.common.utils import to_object_id
from app.features.shows.models import show_public


async def list_shows(
    db: AsyncIOMotorDatabase,
    movie_id: str,
    show_date: str,
    cinema_id: Optional[str] = None,
) -> dict:
    query = {
        "movie_id": to_object_id(movie_id),
        "date": show_date,
    }
    if cinema_id:
        query["cinema_id"] = to_object_id(cinema_id)

    shows = [doc async for doc in db.shows.find(query).sort("start_time", 1)]
    if not shows:
        return {"movie_id": movie_id, "date": show_date, "cinemas": []}

    cinema_ids = list({doc["cinema_id"] for doc in shows})
    screen_ids = list({doc["screen_id"] for doc in shows})
    cinemas = {
        doc["_id"]: doc
        async for doc in db.cinemas.find({"_id": {"$in": cinema_ids}})
    }
    screens = {
        doc["_id"]: doc
        async for doc in db.screens.find({"_id": {"$in": screen_ids}})
    }

    grouped = defaultdict(lambda: defaultdict(list))
    for doc in shows:
        grouped[doc["cinema_id"]][doc["screen_id"]].append(
            {
                "show_id": str(doc["_id"]),
                "start_time": doc["start_time"],
                "end_time": doc["end_time"],
                "price_tiers": doc.get("price_tiers", {}),
            }
        )

    cinema_payloads = []
    for cid, screen_map in grouped.items():
        cinema = cinemas.get(cid)
        if cinema is None:
            continue
        screen_payloads = []
        for sid, showtimes in screen_map.items():
            screen = screens.get(sid)
            screen_payloads.append(
                {
                    "screen_id": str(sid),
                    "screen_name": screen["name"] if screen else "Screen",
                    "showtimes": showtimes,
                }
            )
        screen_payloads.sort(key=lambda item: item["screen_name"])
        cinema_payloads.append(
            {
                "cinema_id": str(cid),
                "cinema_name": cinema["name"],
                "city": cinema["city"],
                "address": cinema.get("address", ""),
                "amenities": cinema.get("amenities")
                or ["M-Ticket", "Food & Beverage"],
                "screens": screen_payloads,
            }
        )
    cinema_payloads.sort(key=lambda item: item["cinema_name"])
    return {"movie_id": movie_id, "date": show_date, "cinemas": cinema_payloads}


async def get_show(db: AsyncIOMotorDatabase, show_id: str) -> dict:
    doc = await db.shows.find_one({"_id": to_object_id(show_id)})
    if doc is None:
        raise NotFoundError("Show not found")
    movie = await db.movies.find_one({"_id": doc["movie_id"]})
    cinema = await db.cinemas.find_one({"_id": doc["cinema_id"]})
    screen = await db.screens.find_one({"_id": doc["screen_id"]})
    return show_public(doc, movie=movie, cinema=cinema, screen=screen)


async def cinemas_for_movie(
    db: AsyncIOMotorDatabase, movie_id: str, city: Optional[str] = None
):
    cinema_ids = await db.shows.distinct(
        "cinema_id", {"movie_id": to_object_id(movie_id)}
    )
    if not cinema_ids:
        return []
    query = {"_id": {"$in": cinema_ids}}
    if city:
        query["city"] = city
    return [
        {
            "id": str(doc["_id"]),
            "name": doc["name"],
            "city": doc["city"],
            "address": doc.get("address", ""),
        }
        async for doc in db.cinemas.find(query).sort("name", 1)
    ]
