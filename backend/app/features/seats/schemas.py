from typing import List, Optional

from pydantic import BaseModel, Field, model_validator


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
    seat_id: Optional[str] = Field(default=None, min_length=1, max_length=8)
    seat_ids: List[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def require_seats(self):
        if not self.seat_ids and not self.seat_id:
            raise ValueError("seat_id or seat_ids is required")
        return self

    def seats(self) -> List[str]:
        ids = list(self.seat_ids)
        if self.seat_id:
            ids.append(self.seat_id)
        return list(dict.fromkeys(ids))


class SeatLockOut(BaseModel):
    show_id: str
    seat_ids: List[str]
    status: str
    expires_in: int
