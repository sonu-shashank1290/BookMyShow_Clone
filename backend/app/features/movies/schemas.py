from typing import Dict, List, Optional

from pydantic import BaseModel


class MovieCinemaOut(BaseModel):
    id: str
    name: str
    city: str
    address: str


class PersonOut(BaseModel):
    name: str
    role: str
    photo_url: str = ""


class MovieOut(BaseModel):
    id: str
    title: str
    language: List[str]
    genre: List[str]
    duration_mins: int
    rating: str
    poster_url: str
    backdrop_url: Optional[str] = None
    description: str
    release_date: Optional[str] = None
    vote_average: float = 0
    vote_count: int = 0
    formats: List[str] = []
    language_formats: Dict[str, List[str]] = {}
    cast: List[PersonOut] = []
    crew: List[PersonOut] = []
    is_active: bool = True
    cinemas: Optional[List[MovieCinemaOut]] = None


class MovieListOut(BaseModel):
    items: List[MovieOut]
    page: int
    page_size: int
    total: int
