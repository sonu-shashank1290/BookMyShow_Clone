from datetime import date
from typing import Any, List

from app.common.utils import oid_str


def movie_public(doc: dict[str, Any]) -> dict[str, Any]:
    release = doc.get("release_date")
    if hasattr(release, "date"):
        release = release.date().isoformat()
    elif hasattr(release, "isoformat"):
        release = release.isoformat()[:10]
    return {
        "id": oid_str(doc["_id"]),
        "title": doc["title"],
        "language": doc.get("language", []),
        "genre": doc.get("genre", []),
        "duration_mins": doc["duration_mins"],
        "rating": doc.get("rating", ""),
        "poster_url": doc.get("poster_url", ""),
        "backdrop_url": doc.get("backdrop_url") or doc.get("poster_url", ""),
        "description": doc.get("description", ""),
        "release_date": release,
        "vote_average": float(doc.get("vote_average") or 0),
        "vote_count": int(doc.get("vote_count") or 0),
        "formats": doc.get("formats") or ["2D"],
        "language_formats": doc.get("language_formats") or {},
        "cast": doc.get("cast") or [],
        "crew": doc.get("crew") or [],
        "is_premiere": bool(doc.get("is_premiere")),
        "is_active": doc.get("is_active", True),
    }


def new_movie_doc(
    title: str,
    language: List[str],
    genre: List[str],
    duration_mins: int,
    rating: str,
    poster_url: str,
    description: str,
    release_date: date,
) -> dict[str, Any]:
    return {
        "title": title,
        "language": language,
        "genre": genre,
        "duration_mins": duration_mins,
        "rating": rating,
        "poster_url": poster_url,
        "description": description,
        "release_date": release_date.isoformat(),
        "is_active": True,
    }
