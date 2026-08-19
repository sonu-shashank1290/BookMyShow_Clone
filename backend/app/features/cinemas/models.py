from typing import Any, List, Optional

from app.common.utils import oid_str


def screen_public(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": oid_str(doc["_id"]),
        "cinema_id": oid_str(doc["cinema_id"]),
        "name": doc["name"],
        "seat_layout": doc.get("seat_layout", {"rows": []}),
    }


def cinema_public(
    doc: dict[str, Any], screens: Optional[List[dict[str, Any]]] = None
) -> dict[str, Any]:
    payload = {
        "id": oid_str(doc["_id"]),
        "name": doc["name"],
        "city": doc["city"],
        "address": doc.get("address", ""),
    }
    if screens is not None:
        payload["screens"] = screens
    return payload
