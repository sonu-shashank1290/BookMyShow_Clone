import secrets
from datetime import datetime
from typing import Any, List, Optional

from app.common.utils import oid_str

# No 0/O/1/I so a usher can read it off a phone without guessing.
_TICKET_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def new_ticket_code() -> str:
    body = "".join(secrets.choice(_TICKET_ALPHABET) for _ in range(8))
    return "BMS-%s" % body


def booking_public(
    doc: dict[str, Any], extras: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    created = doc.get("created_at")
    if hasattr(created, "isoformat"):
        created = created.isoformat()
    payment_id = doc.get("payment_id")
    payload = {
        "id": oid_str(doc["_id"]),
        "user_id": oid_str(doc["user_id"]),
        "show_id": oid_str(doc["show_id"]),
        "seats": doc.get("seats", []),
        "amount": doc.get("amount", 0),
        "status": doc["status"],
        "ticket_code": doc.get("ticket_code"),
        "payment_id": oid_str(payment_id) if payment_id else None,
        "created_at": created,
    }
    if extras:
        payload.update(extras)
    return payload


def new_booking_doc(user_id, show_id, seats: List[str], amount: int) -> dict[str, Any]:
    return {
        "user_id": user_id,
        "show_id": show_id,
        "seats": seats,
        "amount": amount,
        "status": "pending",
        "payment_id": None,
        "created_at": datetime.utcnow(),
    }
