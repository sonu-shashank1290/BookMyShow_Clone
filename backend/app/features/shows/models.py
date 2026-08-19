from typing import Any, Optional

from app.common.utils import oid_str


def show_public(
    doc: dict[str, Any],
    movie: Optional[dict[str, Any]] = None,
    cinema: Optional[dict[str, Any]] = None,
    screen: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    payload = {
        "id": oid_str(doc["_id"]),
        "movie_id": oid_str(doc["movie_id"]),
        "cinema_id": oid_str(doc["cinema_id"]),
        "screen_id": oid_str(doc["screen_id"]),
        "date": doc["date"],
        "start_time": doc["start_time"],
        "end_time": doc["end_time"],
        "city": doc.get("city"),
        "language": doc.get("language"),
        "format": doc.get("format"),
        "price_tiers": doc.get("price_tiers", {}),
        "booked_seats": doc.get("booked_seats", []),
    }
    if movie is not None:
        payload["movie_title"] = movie.get("title")
        payload["movie_rating"] = movie.get("rating")
        payload["languages"] = movie.get("language") or []
        payload["formats"] = movie.get("formats") or ["2D"]
    if cinema is not None:
        payload["cinema_name"] = cinema.get("name")
        payload["cinema_address"] = cinema.get("address", "")
    if screen is not None:
        payload["screen_name"] = screen.get("name")
    return payload
