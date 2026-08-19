from typing import Optional

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.common.exceptions import UnauthorizedError
from app.core.database import get_database
from app.core.security import decode_token

_bearer = HTTPBearer(auto_error=False)


async def get_db() -> AsyncIOMotorDatabase:
    return get_database()


def _user_id_from_creds(creds: Optional[HTTPAuthorizationCredentials]) -> Optional[str]:
    if creds is None:
        return None
    payload = decode_token(creds.credentials)
    if payload.get("type") != "access" or not payload.get("sub"):
        raise UnauthorizedError("Invalid access token")
    return str(payload["sub"])


async def get_current_user_id(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> str:
    user_id = _user_id_from_creds(creds)
    if user_id is None:
        raise UnauthorizedError("Missing access token")
    return user_id


async def get_optional_user_id(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[str]:
    return _user_id_from_creds(creds)
