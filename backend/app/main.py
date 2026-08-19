from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.common.exceptions import register_exception_handlers
from app.core.config import settings
from app.core.database import close_db, connect_db, get_database
from app.features.auth.router import router as auth_router
from app.features.booking.router import router as booking_router
from app.features.cinemas.router import cities_router
from app.features.cinemas.router import router as cinemas_router
from app.features.movies.router import router as movies_router
from app.features.payment.router import router as payment_router
from app.features.seats.router import router as seats_router
from app.features.shows.router import router as shows_router


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
register_exception_handlers(app)

app.include_router(auth_router)
app.include_router(movies_router)
app.include_router(cinemas_router)
app.include_router(cities_router)
app.include_router(shows_router)
app.include_router(seats_router)
app.include_router(booking_router)
app.include_router(payment_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> JSONResponse:
    mongo = "down"
    try:
        await get_database().command("ping")
        mongo = "ok"
    except Exception:
        pass

    return JSONResponse(
        status_code=200 if mongo == "ok" else 503,
        content={"status": mongo, "mongo": mongo},
    )
