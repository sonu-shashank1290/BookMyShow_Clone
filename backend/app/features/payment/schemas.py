from pydantic import BaseModel

from app.features.booking.schemas import BookingOut


class PayRequest(BaseModel):
    success: bool = True


class PaymentOut(BaseModel):
    id: str
    booking_id: str
    amount: int
    status: str
    provider_ref: str
    booking: BookingOut
