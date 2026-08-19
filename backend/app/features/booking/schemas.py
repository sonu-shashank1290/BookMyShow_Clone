from typing import List, Optional

from pydantic import BaseModel, Field


class CreateBookingRequest(BaseModel):
    show_id: str
    seats: List[str] = Field(min_length=1)


class BookingOut(BaseModel):
    id: str
    user_id: str
    show_id: str
    seats: List[str]
    amount: int
    status: str
    payment_id: Optional[str] = None
    created_at: Optional[str] = None
    movie_title: Optional[str] = None
    movie_rating: Optional[str] = None
    languages: Optional[List[str]] = None
    cinema_name: Optional[str] = None
    cinema_address: Optional[str] = None
    screen_name: Optional[str] = None
    show_date: Optional[str] = None
    start_time: Optional[str] = None


class BookingListOut(BaseModel):
    items: List[BookingOut]
