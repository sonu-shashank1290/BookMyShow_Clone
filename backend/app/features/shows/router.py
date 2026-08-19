from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_db
from app.features.shows import service
from app.features.shows.schemas import ShowListOut, ShowOut

router = APIRouter(prefix="/shows", tags=["shows"])


@router.get("", response_model=ShowListOut)
async def list_shows(
    movie_id: str = Query(...),
    date: str = Query(..., pattern=r"^\d{4}-\d{2}-\d{2}$"),
    cinema_id: Optional[str] = Query(default=None),
    city: Optional[str] = Query(default=None),
    language: Optional[str] = Query(default=None),
    format: Optional[str] = Query(default=None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    return await service.list_shows(
        db,
        movie_id,
        date,
        cinema_id,
        city=city,
        language=language,
        fmt=format,
    )


@router.get("/{show_id}", response_model=ShowOut)
async def get_show(
    show_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    return await service.get_show(db, show_id)
