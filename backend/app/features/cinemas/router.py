from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.deps import get_db
from app.features.cinemas import service
from app.features.cinemas.schemas import CinemaListOut, CinemaOut

router = APIRouter(prefix="/cinemas", tags=["cinemas"])


@router.get("", response_model=CinemaListOut, response_model_exclude_none=True)
async def list_cinemas(
    city: Optional[str] = Query(default=None),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    return await service.list_cinemas(db, city=city)


@router.get("/{cinema_id}", response_model=CinemaOut)
async def get_cinema(
    cinema_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    return await service.get_cinema(db, cinema_id)
