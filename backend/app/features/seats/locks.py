from datetime import datetime, timedelta, timezone
from threading import Lock
from typing import Dict, Optional, Tuple

TTL_SECONDS = 600

_store = {}  # type: Dict[Tuple[str, str], dict]
_guard = Lock()


def _now():
    return datetime.now(timezone.utc)


def _purge_if_expired(show_id, seat_id):
    key = (show_id, seat_id)
    item = _store.get(key)
    if item is None:
        return None
    if item["expires_at"] <= _now():
        _store.pop(key, None)
        return None
    return item


def get_lock(show_id, seat_id):
    with _guard:
        return _purge_if_expired(show_id, seat_id)


def acquire(show_id, seat_id, user_id):
    with _guard:
        existing = _purge_if_expired(show_id, seat_id)
        if existing is not None and existing["user_id"] != user_id:
            return None
        item = {
            "user_id": user_id,
            "expires_at": _now() + timedelta(seconds=TTL_SECONDS),
        }
        _store[(show_id, seat_id)] = item
        return item


def release(show_id, seat_id, user_id):
    with _guard:
        existing = _purge_if_expired(show_id, seat_id)
        if existing is None:
            return True
        if existing["user_id"] != user_id:
            return False
        _store.pop((show_id, seat_id), None)
        return True


def locks_for_show(show_id):
    with _guard:
        result = {}
        for (sid, seat_id), item in list(_store.items()):
            if sid != show_id:
                continue
            kept = _purge_if_expired(sid, seat_id)
            if kept is not None:
                result[seat_id] = kept
        return result


def owned_by(show_id, seat_id, user_id):
    item = get_lock(show_id, seat_id)
    return item is not None and item["user_id"] == user_id


def all_owned(show_id, seat_ids, user_id):
    return all(owned_by(show_id, seat_id, user_id) for seat_id in seat_ids)


def release_many(show_id, seat_ids, user_id):
    for seat_id in seat_ids:
        release(show_id, seat_id, user_id)
