from typing import List

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.common.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.common.utils import to_object_id
from app.features.booking.models import booking_public, new_booking_doc, new_ticket_code
from app.features.seats import locks
from app.features.seats.show_queue import submit as enqueue_show
from app.features.seats.service import _screen_for_show
from app.features.shows.service import get_show


async def _booking_extras(db: AsyncIOMotorDatabase, booking: dict) -> dict:
    show = await db.shows.find_one({"_id": booking["show_id"]})
    extras = {}
    if show is None:
        return extras
    extras["show_date"] = show.get("date")
    extras["start_time"] = show.get("start_time")
    extras["language"] = show.get("language")
    extras["format"] = show.get("format")
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
    if booking.get("status") == "confirmed" and not booking.get("ticket_code"):
        booking = await _ensure_ticket_code(db, booking)
    extras = await _booking_extras(db, booking)
    return booking_public(booking, extras)


async def _ensure_ticket_code(db: AsyncIOMotorDatabase, booking: dict) -> dict:
    """Old confirmed bookings predate ticket_code; mint one the first time they are read."""
    for _ in range(5):
        code = new_ticket_code()
        try:
            updated = await db.bookings.find_one_and_update(
                {"_id": booking["_id"], "ticket_code": {"$exists": False}},
                {"$set": {"ticket_code": code}},
                return_document=ReturnDocument.AFTER,
            )
        except DuplicateKeyError:
            continue
        if updated is not None:
            return updated
        latest = await db.bookings.find_one({"_id": booking["_id"]})
        return latest or booking
    return booking


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
    async def _create():
        unique = list(dict.fromkeys(seats))
        show = await get_show(db, show_id)
        screen = await _screen_for_show(db, show)
        booked = set(show.get("booked_seats") or [])
        if any(seat in booked for seat in unique):
            raise ConflictError("One or more seats are already booked")
        if not await locks.all_owned(db, show_id, unique, user_id):
            raise ConflictError("All seats must be locked by you before booking")

        amount = _amount_for_seats(show, screen.get("seat_layout", {}), unique)
        doc = new_booking_doc(to_object_id(user_id), to_object_id(show_id), unique, amount)
        result = await db.bookings.insert_one(doc)
        doc["_id"] = result.inserted_id
        return await booking_detail(db, doc)

    return await enqueue_show(show_id, _create)


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

    async def _confirm():
        seats = booking["seats"]
        user_id = str(booking["user_id"])
        if not await locks.all_owned(db, show_id, seats, user_id):
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
            await locks.release_many(db, show_id, seats, user_id)
            raise ConflictError("One or more seats were booked by someone else")

        updated = None
        for _ in range(5):
            try:
                updated = await db.bookings.find_one_and_update(
                    {"_id": booking["_id"], "status": "pending"},
                    {
                        "$set": {
                            "status": "confirmed",
                            "payment_id": payment_id,
                            "ticket_code": new_ticket_code(),
                        }
                    },
                    return_document=ReturnDocument.AFTER,
                )
                break
            except DuplicateKeyError:
                continue
        if updated is None:
            updated = await db.bookings.find_one_and_update(
                {"_id": booking["_id"], "status": "pending"},
                {"$set": {"status": "confirmed", "payment_id": payment_id}},
                return_document=ReturnDocument.AFTER,
            )
        if updated is None:
            raise ConflictError("Booking is not pending")
        await locks.release_many(db, show_id, seats, user_id)
        return await booking_detail(db, updated)

    return await enqueue_show(show_id, _confirm)


async def cancel_pending_booking(
    db: AsyncIOMotorDatabase, booking_id: str, user_id: str
) -> dict:
    booking = await get_booking_for_user(db, booking_id, user_id)
    if booking["status"] != "pending":
        raise ConflictError("Only a pending booking can be discarded")
    show_id = str(booking["show_id"])
    await locks.release_many(db, show_id, booking["seats"], user_id)
    await db.bookings.delete_one({"_id": booking["_id"], "status": "pending"})
    return {"deleted": True, "show_id": show_id}


async def fail_booking(db: AsyncIOMotorDatabase, booking: dict) -> dict:
    updated = await db.bookings.find_one_and_update(
        {"_id": booking["_id"], "status": "pending"},
        {"$set": {"status": "cancelled"}},
        return_document=ReturnDocument.AFTER,
    )
    await locks.release_many(db, str(booking["show_id"]), booking["seats"], str(booking["user_id"]))
    return await booking_detail(db, updated or booking)
