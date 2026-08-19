from typing import List

from pydantic import BaseModel, Field


class SeatOut(BaseModel):
    id: str
    status: str
    locked_by_me: bool = False


class SeatRowOut(BaseModel):
    row: str
    tier: str
    seats: List[SeatOut]


class SeatMapOut(BaseModel):
    show_id: str
    price_tiers: dict
    rows: List[SeatRowOut]


class SeatLockRequest(BaseModel):
    show_id: str
    seat_id: str = Field(min_length=1, max_length=8)


class SeatLockOut(BaseModel):
    show_id: str
    seat_id: str
    status: str
    expires_in: int
