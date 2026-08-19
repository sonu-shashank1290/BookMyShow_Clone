from datetime import datetime
from typing import Any, Optional

from app.common.utils import oid_str


def user_public(doc: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": oid_str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "phone": doc.get("phone"),
    }


def new_user_doc(
    name: str,
    email: str,
    password_hash: str,
    phone: Optional[str],
) -> dict[str, Any]:
    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "phone": phone,
        "created_at": datetime.utcnow(),
    }
