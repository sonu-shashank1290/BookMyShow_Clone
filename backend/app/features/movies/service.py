from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.exceptions import NotFoundError
from app.common.pagination import PaginationParams
from app.common.utils import to_object_id
from app.features.movies.models import movie_public
from app.features.shows.service import cinemas_for_movie


async def list_movies(
    db: AsyncIOMotorDatabase,
    pagination: PaginationParams,
    language: Optional[str] = None,
    genre: Optional[str] = None,
    city: Optional[str] = None,
    premiere: Optional[bool] = None,
) -> dict:
    query = {"is_active": True}
    if language:
        query["language"] = language
    if genre:
        query["genre"] = genre
    if premiere is not None:
        query["is_premiere"] = premiere
    if city:
        # Only surface movies that are actually screening in the chosen city.
        query["_id"] = {"$in": await db.shows.distinct("movie_id", {"city": city})}

    total = await db.movies.count_documents(query)
    cursor = (
        db.movies.find(query)
        .sort([("sort_order", 1), ("release_date", -1)])
        .skip(pagination.skip)
        .limit(pagination.page_size)
    )
    items = [movie_public(doc) async for doc in cursor]
    return {
        "items": items,
        "page": pagination.page,
        "page_size": pagination.page_size,
        "total": total,
    }


async def get_movie(
    db: AsyncIOMotorDatabase, movie_id: str, city: Optional[str] = None
) -> dict:
    doc = await db.movies.find_one({"_id": to_object_id(movie_id)})
    if doc is None:
        raise NotFoundError("Movie not found")
    payload = movie_public(doc)
    payload["cinemas"] = await cinemas_for_movie(db, movie_id, city)
    return payload
