from typing import List

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.common.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.common.utils import to_object_id
from app.features.booking.models import booking_public, new_booking_doc
from app.features.seats import locks
from app.features.seats.service import _screen_for_show
from app.features.shows.service import get_show


async def _booking_extras(db: AsyncIOMotorDatabase, booking: dict) -> dict:
    show = await db.shows.find_one({"_id": booking["show_id"]})
    extras = {}
    if show is None:
        return extras
    extras["show_date"] = show.get("date")
    extras["start_time"] = show.get("start_time")
    movie = await db.movies.find_one({"_id": show["movie_id"]})
    cinema = await db.cinemas.find_one({"_id": show["cinema_id"]})
    screen = await db.screens.find_one({"_id": show["screen_id"]})
    if movie:
        extras["movie_title"] = movie.get("title")
        extras["movie_rating"] = movie.get("rating")
        extras["languages"] = movie.get("language") or []
    if cinema:
        extras["cinema_name"] = cinema.get("name")
        extras["cinema_address"] = cinema.get("address", "")
    if screen:
        extras["screen_name"] = screen.get("name")
    return extras


async def booking_detail(db: AsyncIOMotorDatabase, booking: dict) -> dict:
    extras = await _booking_extras(db, booking)
    return booking_public(booking, extras)


def _seat_tier(layout, seat_id):
    for row in layout.get("rows", []):
        if seat_id in row.get("seats", []):
            return row["tier"]
    return None


def _amount_for_seats(show, layout, seats: List[str]) -> int:
    tiers = show.get("price_tiers") or {}
    total = 0
    for seat_id in seats:
        tier = _seat_tier(layout, seat_id)
        if tier is None:
            raise ConflictError("Seat %s is not on this screen" % seat_id)
        total += int(tiers.get(tier, 0))
    return total


async def create_booking(
    db: AsyncIOMotorDatabase, user_id: str, show_id: str, seats: List[str]
) -> dict:
    seats = list(dict.fromkeys(seats))
    show = await get_show(db, show_id)
    screen = await _screen_for_show(db, show)
    booked = set(show.get("booked_seats") or [])
    if any(seat in booked for seat in seats):
        raise ConflictError("One or more seats are already booked")
    if not locks.all_owned(show_id, seats, user_id):
        raise ConflictError("All seats must be locked by you before booking")

    amount = _amount_for_seats(show, screen.get("seat_layout", {}), seats)
    doc = new_booking_doc(to_object_id(user_id), to_object_id(show_id), seats, amount)
    result = await db.bookings.insert_one(doc)
    doc["_id"] = result.inserted_id
    return await booking_detail(db, doc)


async def list_my_bookings(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    items = []
    async for doc in db.bookings.find({"user_id": to_object_id(user_id)}).sort(
        "created_at", -1
    ):
        items.append(await booking_detail(db, doc))
    return {"items": items}


async def get_booking_for_user(
    db: AsyncIOMotorDatabase, booking_id: str, user_id: str
) -> dict:
    doc = await db.bookings.find_one({"_id": to_object_id(booking_id)})
    if doc is None:
        raise NotFoundError("Booking not found")
    if str(doc["user_id"]) != user_id:
        raise ForbiddenError("Not your booking")
    return doc


async def confirm_booking(
    db: AsyncIOMotorDatabase, booking: dict, payment_id: ObjectId
) -> dict:
    show_id = str(booking["show_id"])
    seats = booking["seats"]
    user_id = str(booking["user_id"])
    if not locks.all_owned(show_id, seats, user_id):
        await db.bookings.update_one(
            {"_id": booking["_id"]}, {"$set": {"status": "expired"}}
        )
        raise ConflictError("Seat locks expired; booking cannot be confirmed")

    updated_show = await db.shows.find_one_and_update(
        {"_id": booking["show_id"], "booked_seats": {"$nin": seats}},
        {"$addToSet": {"booked_seats": {"$each": seats}}},
        return_document=ReturnDocument.AFTER,
    )
    if updated_show is None:
        await db.bookings.update_one(
            {"_id": booking["_id"]}, {"$set": {"status": "cancelled"}}
        )
        locks.release_many(show_id, seats, user_id)
        raise ConflictError("One or more seats were booked by someone else")

    updated = await db.bookings.find_one_and_update(
        {"_id": booking["_id"], "status": "pending"},
        {"$set": {"status": "confirmed", "payment_id": payment_id}},
        return_document=ReturnDocument.AFTER,
    )
    locks.release_many(show_id, seats, user_id)
    return await booking_detail(db, updated)


async def cancel_pending_booking(
    db: AsyncIOMotorDatabase, booking_id: str, user_id: str
) -> dict:
    booking = await get_booking_for_user(db, booking_id, user_id)
    if booking["status"] != "pending":
        raise ConflictError("Only a pending booking can be discarded")
    show_id = str(booking["show_id"])
    locks.release_many(show_id, booking["seats"], user_id)
    await db.bookings.delete_one({"_id": booking["_id"], "status": "pending"})
    return {"deleted": True, "show_id": show_id}


async def fail_booking(db: AsyncIOMotorDatabase, booking: dict) -> dict:
    updated = await db.bookings.find_one_and_update(
        {"_id": booking["_id"], "status": "pending"},
        {"$set": {"status": "cancelled"}},
        return_document=ReturnDocument.AFTER,
    )
    locks.release_many(str(booking["show_id"]), booking["seats"], str(booking["user_id"]))
    return await booking_detail(db, updated or booking)
