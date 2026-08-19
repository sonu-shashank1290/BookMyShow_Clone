from typing import Dict, List, Optional

from pydantic import BaseModel


class ShowtimeOut(BaseModel):
    show_id: str
    start_time: str
    end_time: str
    price_tiers: Dict[str, int]


class ScreenShowtimesOut(BaseModel):
    screen_id: str
    screen_name: str
    showtimes: List[ShowtimeOut]


class CinemaShowtimesOut(BaseModel):
    cinema_id: str
    cinema_name: str
    city: str
    address: str = ""
    amenities: List[str] = []
    screens: List[ScreenShowtimesOut]


class ShowListOut(BaseModel):
    movie_id: str
    date: str
    cinemas: List[CinemaShowtimesOut]


class ShowOut(BaseModel):
    id: str
    movie_id: str
    cinema_id: str
    screen_id: str
    date: str
    start_time: str
    end_time: str
    price_tiers: Dict[str, int]
    booked_seats: List[str]
    movie_title: Optional[str] = None
    movie_rating: Optional[str] = None
    languages: Optional[List[str]] = None
    formats: Optional[List[str]] = None
    cinema_name: Optional[str] = None
    cinema_address: Optional[str] = None
    screen_name: Optional[str] = None
