from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.exceptions import BadRequestError, ConflictError, ForbiddenError, NotFoundError
from app.common.utils import to_object_id
from app.features.seats import locks
from app.features.shows.service import get_show


def _seat_ids(layout):
    ids = set()
    for row in layout.get("rows", []):
        ids.update(row.get("seats", []))
    return ids


async def _screen_for_show(db: AsyncIOMotorDatabase, show: dict) -> dict:
    screen = await db.screens.find_one({"_id": to_object_id(show["screen_id"])})
    if screen is None:
        raise NotFoundError("Screen not found")
    return screen


async def get_seat_map(
    db: AsyncIOMotorDatabase, show_id: str, user_id: Optional[str] = None
) -> dict:
    show = await get_show(db, show_id)
    screen = await _screen_for_show(db, show)
    booked = set(show.get("booked_seats") or [])
    active_locks = locks.locks_for_show(show_id)

    rows = []
    for row in screen.get("seat_layout", {}).get("rows", []):
        seats = []
        for seat_id in row.get("seats", []):
            held = active_locks.get(seat_id)
            if seat_id in booked:
                status = "booked"
                locked_by_me = False
            elif held is not None:
                status = "locked"
                locked_by_me = user_id is not None and held["user_id"] == user_id
            else:
                status = "available"
                locked_by_me = False
            seats.append(
                {"id": seat_id, "status": status, "locked_by_me": locked_by_me}
            )
        rows.append({"row": row["row"], "tier": row["tier"], "seats": seats})

    return {
        "show_id": show_id,
        "price_tiers": show.get("price_tiers", {}),
        "rows": rows,
    }


async def lock_seat(
    db: AsyncIOMotorDatabase, show_id: str, seat_id: str, user_id: str
) -> dict:
    show = await get_show(db, show_id)
    screen = await _screen_for_show(db, show)
    if seat_id not in _seat_ids(screen.get("seat_layout", {})):
        raise BadRequestError("Seat does not exist on this screen")
    if seat_id in (show.get("booked_seats") or []):
        raise ConflictError("Seat already booked")

    item = locks.acquire(show_id, seat_id, user_id)
    if item is None:
        raise ConflictError("Seat is locked by another user")
    return {
        "show_id": show_id,
        "seat_id": seat_id,
        "status": "locked",
        "expires_in": locks.TTL_SECONDS,
    }


async def unlock_seat(
    db: AsyncIOMotorDatabase, show_id: str, seat_id: str, user_id: str
) -> dict:
    await get_show(db, show_id)
    if not locks.release(show_id, seat_id, user_id):
        raise ForbiddenError("You do not hold this seat lock")
    return {"show_id": show_id, "seat_id": seat_id, "status": "available"}
