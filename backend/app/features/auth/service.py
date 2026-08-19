from typing import Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo.errors import DuplicateKeyError

from app.common.exceptions import ConflictError, UnauthorizedError
from app.common.utils import to_object_id
from app.core.security import create_access_token, hash_password, verify_password
from app.features.auth.models import new_user_doc, user_public


def _normalize_email(email: str) -> str:
    return email.strip().lower()


async def signup(
    db: AsyncIOMotorDatabase,
    name: str,
    email: str,
    password: str,
    phone: Optional[str],
) -> dict:
    email = _normalize_email(email)
    if await db.users.find_one({"email": email}):
        raise ConflictError("Email already registered")

    doc = new_user_doc(name.strip(), email, hash_password(password), phone)
    try:
        result = await db.users.insert_one(doc)
    except DuplicateKeyError as exc:
        raise ConflictError("Email already registered") from exc

    doc["_id"] = result.inserted_id
    user = user_public(doc)
    return {
        "access_token": create_access_token(user["id"]),
        "token_type": "bearer",
        "user": user,
    }


async def login(db: AsyncIOMotorDatabase, email: str, password: str) -> dict:
    email = _normalize_email(email)
    doc = await db.users.find_one({"email": email})
    if doc is None or not verify_password(password, doc["password_hash"]):
        raise UnauthorizedError("Invalid email or password")

    user = user_public(doc)
    return {
        "access_token": create_access_token(user["id"]),
        "token_type": "bearer",
        "user": user,
    }


async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    doc = await db.users.find_one({"_id": to_object_id(user_id)})
    if doc is None:
        raise UnauthorizedError("User not found")
    return user_public(doc)
