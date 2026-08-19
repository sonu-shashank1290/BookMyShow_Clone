import uuid

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.exceptions import ConflictError
from app.features.booking import service as booking_service
from app.features.payment.models import payment_public


async def pay(
    db: AsyncIOMotorDatabase, booking_id: str, user_id: str, success: bool
) -> dict:
    booking = await booking_service.get_booking_for_user(db, booking_id, user_id)
    if booking["status"] != "pending":
        raise ConflictError("Booking is not pending payment")

    if success:
        payment = {
            "booking_id": booking["_id"],
            "amount": booking["amount"],
            "status": "success",
            "provider_ref": "mock_%s" % uuid.uuid4().hex[:12],
        }
        result = await db.payments.insert_one(payment)
        payment["_id"] = result.inserted_id
        confirmed = await booking_service.confirm_booking(db, booking, result.inserted_id)
        payload = payment_public(payment)
        payload["booking"] = confirmed
        return payload

    payment = {
        "booking_id": booking["_id"],
        "amount": booking["amount"],
        "status": "failed",
        "provider_ref": "mock_fail_%s" % uuid.uuid4().hex[:8],
    }
    result = await db.payments.insert_one(payment)
    payment["_id"] = result.inserted_id
    cancelled = await booking_service.fail_booking(db, booking)
    payload = payment_public(payment)
    payload["booking"] = cancelled
    return payload
