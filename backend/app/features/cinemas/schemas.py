from typing import List, Optional

from pydantic import BaseModel


class SeatRowOut(BaseModel):
    row: str
    tier: str
    seats: List[str]


class SeatLayoutOut(BaseModel):
    rows: List[SeatRowOut]


class ScreenOut(BaseModel):
    id: str
    cinema_id: str
    name: str
    seat_layout: SeatLayoutOut


class CinemaOut(BaseModel):
    id: str
    name: str
    city: str
    address: str
    screens: Optional[List[ScreenOut]] = None


class CinemaListOut(BaseModel):
    items: List[CinemaOut]
