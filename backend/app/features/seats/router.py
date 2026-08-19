from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_user_id, get_db, get_optional_user_id
from app.features.seats import service
from app.features.seats.schemas import SeatLockOut, SeatLockRequest, SeatMapOut

router = APIRouter(tags=["seats"])


@router.get("/shows/{show_id}/seats", response_model=SeatMapOut)
async def get_seats(
    show_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: Optional[str] = Depends(get_optional_user_id),
) -> dict:
    return await service.get_seat_map(db, show_id, user_id)


@router.post("/seats/lock", response_model=SeatLockOut)
async def lock_seat(
    body: SeatLockRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.lock_seat(db, body.show_id, body.seat_id, user_id)


@router.delete("/seats/lock")
async def unlock_seat(
    show_id: str = Query(...),
    seat_id: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    return await service.unlock_seat(db, show_id, seat_id, user_id)
