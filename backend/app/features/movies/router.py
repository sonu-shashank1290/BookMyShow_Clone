from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.pagination import PaginationParams, pagination_params
from app.core.deps import get_db
from app.features.movies import service
from app.features.movies.schemas import MovieListOut, MovieOut

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("", response_model=MovieListOut)
async def list_movies(
    language: Optional[str] = Query(default=None),
    genre: Optional[str] = Query(default=None),
    pagination: PaginationParams = Depends(pagination_params),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    return await service.list_movies(db, pagination, language=language, genre=genre)


@router.get("/{movie_id}", response_model=MovieOut)
async def get_movie(
    movie_id: str,
    city: Optional[str] = Query(default=None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    return await service.get_movie(db, movie_id, city=city)
