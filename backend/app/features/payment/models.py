from typing import Any

from app.common.utils import oid_str


def payment_public(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": oid_str(doc["_id"]),
        "booking_id": oid_str(doc["booking_id"]),
        "amount": doc["amount"],
        "status": doc["status"],
        "provider_ref": doc.get("provider_ref", ""),
    }
