from __future__ import annotations

from bson import ObjectId
from bson.errors import InvalidId

from app.common.exceptions import BadRequestError


def to_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except InvalidId as exc:
        raise BadRequestError("Invalid id") from exc


def oid_str(value: ObjectId | str) -> str:
    return str(value)
