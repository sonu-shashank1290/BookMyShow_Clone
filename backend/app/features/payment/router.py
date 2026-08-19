from typing import Optional

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_current_user_id, get_db
from app.features.payment import service
from app.features.payment.schemas import PayRequest, PaymentOut

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/{booking_id}", response_model=PaymentOut)
async def pay(
    booking_id: str,
    body: Optional[PayRequest] = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
) -> dict:
    success = True if body is None else body.success
    return await service.pay(db, booking_id, user_id, success)
