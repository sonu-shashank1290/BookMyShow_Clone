from datetime import datetime, timedelta, timezone
from typing import List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

TTL_SECONDS = 600


def _now():
    return datetime.now(timezone.utc)


def _expires_at():
    return _now() + timedelta(seconds=TTL_SECONDS)


async def acquire(db: AsyncIOMotorDatabase, show_id: str, seat_id: str, user_id: str):
    """Take a seat hold. Unique (show_id, seat_id) makes this atomic across workers."""
    now = _now()
    expires = _expires_at()
    filt = {
        "show_id": show_id,
        "seat_id": seat_id,
        "$or": [{"user_id": user_id}, {"expires_at": {"$lte": now}}],
    }
    update = {
        "$set": {"user_id": user_id, "expires_at": expires},
        "$setOnInsert": {"show_id": show_id, "seat_id": seat_id},
    }
    try:
        doc = await db.seat_locks.find_one_and_update(
            filt,
            update,
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        return doc
    except DuplicateKeyError:
        # Another user holds a live lock, or we lost the insert race.
        return None


async def acquire_many(
    db: AsyncIOMotorDatabase, show_id: str, seat_ids: List[str], user_id: str
) -> Optional[List[str]]:
    """Lock every seat or none. Sorted order avoids deadlocks when five people overlap."""
    ordered = sorted(dict.fromkeys(seat_ids))
    if not ordered:
        return []
    already = set()
    for seat_id in ordered:
        if await owned_by(db, show_id, seat_id, user_id):
            already.add(seat_id)

    newly = []
    for seat_id in ordered:
        item = await acquire(db, show_id, seat_id, user_id)
        if item is None:
            await release_many(db, show_id, newly, user_id)
            return None
        if seat_id not in already:
            newly.append(seat_id)
    return ordered


async def release(db: AsyncIOMotorDatabase, show_id: str, seat_id: str, user_id: str) -> bool:
    result = await db.seat_locks.delete_one(
        {"show_id": show_id, "seat_id": seat_id, "user_id": user_id}
    )
    if result.deleted_count:
        return True
    existing = await db.seat_locks.find_one(
        {"show_id": show_id, "seat_id": seat_id, "expires_at": {"$gt": _now()}}
    )
    return existing is None


async def release_many(
    db: AsyncIOMotorDatabase, show_id: str, seat_ids: List[str], user_id: str
) -> None:
    if not seat_ids:
        return
    await db.seat_locks.delete_many(
        {"show_id": show_id, "seat_id": {"$in": list(seat_ids)}, "user_id": user_id}
    )


async def locks_for_show(db: AsyncIOMotorDatabase, show_id: str) -> dict:
    result = {}
    cursor = db.seat_locks.find({"show_id": show_id, "expires_at": {"$gt": _now()}})
    async for doc in cursor:
        result[doc["seat_id"]] = doc
    return result


async def owned_by(
    db: AsyncIOMotorDatabase, show_id: str, seat_id: str, user_id: str
) -> bool:
    doc = await db.seat_locks.find_one(
        {
            "show_id": show_id,
            "seat_id": seat_id,
            "user_id": user_id,
            "expires_at": {"$gt": _now()},
        }
    )
    return doc is not None


async def all_owned(
    db: AsyncIOMotorDatabase, show_id: str, seat_ids: List[str], user_id: str
) -> bool:
    wanted = list(dict.fromkeys(seat_ids))
    if not wanted:
        return False
    count = await db.seat_locks.count_documents(
        {
            "show_id": show_id,
            "user_id": user_id,
            "seat_id": {"$in": wanted},
            "expires_at": {"$gt": _now()},
        }
    )
    return count == len(wanted)
