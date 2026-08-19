from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from app.core.deps import get_current_user_id, get_db
from app.features.booking import service
from app.features.booking.schemas import BookingListOut, BookingOut, CreateBookingRequest


class CancelPendingOut(BaseModel):
    deleted: bool
    show_id: str

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut)
async def create_booking(
    body: CreateBookingRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.create_booking(db, user_id, body.show_id, body.seats)


@router.get("/me", response_model=BookingListOut)
async def my_bookings(
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.list_my_bookings(db, user_id)


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    booking = await service.get_booking_for_user(db, booking_id, user_id)
    return await service.booking_detail(db, booking)


@router.delete("/{booking_id}", response_model=CancelPendingOut)
async def cancel_pending(
    booking_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.cancel_pending_booking(db, booking_id, user_id)
