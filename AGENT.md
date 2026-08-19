# AGENT.md — BookMyShow Clone

This file is the source of truth for how this project should be built. It describes the tech
stack, architecture, feature boundaries, data models, and core flows. Any agent (human or AI)
working on this repo should read this before writing code.

---

## 1. Tech Stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Frontend   | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend    | FastAPI (Python 3.11+)                   |
| Database   | MongoDB (Motor async driver)             |
| Auth       | JWT (access + refresh tokens)            |
| Realtime   | WebSockets (seat-lock updates)           |
| Cache/Lock | Redis (seat hold locks, TTL-based)       |
| Deployment | Docker Compose (frontend, backend, mongo, redis) |

---

## 2. Architecture Principle: Feature-Based

Both frontend and backend are organized **by feature/domain**, not by technical layer.
Each feature owns its own models, routes/services, components, and types. Shared/generic
code lives in a `common`/`shared` module. Avoid a global `models/`, `controllers/`,
`components/` dumping ground — a feature folder should be deletable without breaking
unrelated features.

---

## 3. Repo Structure

```
bookmyshow-clone/
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js App Router (routes only, thin)
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── (auth)/signup/page.tsx
│   │   │   ├── movies/page.tsx
│   │   │   ├── movies/[movieId]/page.tsx
│   │   │   ├── cinemas/[cinemaId]/page.tsx
│   │   │   ├── booking/[showId]/page.tsx
│   │   │   ├── booking/[showId]/seats/page.tsx
│   │   │   ├── payment/[bookingId]/page.tsx
│   │   │   ├── my-bookings/page.tsx
│   │   │   └── layout.tsx
│   │   ├── features/
│   │   │   ├── movies/
│   │   │   │   ├── api/                # fetch calls to backend
│   │   │   │   ├── components/         # MovieCard, MovieDetails, MovieFilters
│   │   │   │   ├── hooks/
│   │   │   │   └── types.ts
│   │   │   ├── cinemas/
│   │   │   │   ├── api/
│   │   │   │   ├── components/         # CinemaList, ScreenBadge
│   │   │   │   └── types.ts
│   │   │   ├── shows/                  # showtimes per movie/cinema/screen/date
│   │   │   │   ├── api/
│   │   │   │   ├── components/         # DatePicker, ShowtimeGrid, ScreenTabs
│   │   │   │   └── types.ts
│   │   │   ├── seats/
│   │   │   │   ├── api/
│   │   │   │   ├── components/         # SeatMap, SeatLegend, SeatSummary
│   │   │   │   ├── hooks/              # useSeatLockSocket
│   │   │   │   └── types.ts
│   │   │   ├── booking/
│   │   │   │   ├── api/
│   │   │   │   ├── components/         # BookingSummary, BookingConfirmation
│   │   │   │   └── types.ts
│   │   │   ├── payment/
│   │   │   │   ├── api/
│   │   │   │   ├── components/
│   │   │   │   └── types.ts
│   │   │   └── auth/
│   │   │       ├── api/
│   │   │       ├── components/
│   │   │       └── store/              # auth context / zustand slice
│   │   ├── common/
│   │   │   ├── components/             # Button, Modal, Toast, Skeletons
│   │   │   ├── lib/                    # api client, socket client, formatters
│   │   │   └── hooks/
│   │   └── styles/
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI app, router registration
│   │   ├── core/
│   │   │   ├── config.py               # env settings
│   │   │   ├── database.py             # Motor client, db handle
│   │   │   ├── redis_client.py
│   │   │   ├── security.py             # JWT, password hashing
│   │   │   └── deps.py                 # shared FastAPI dependencies
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py          # pydantic request/response models
│   │   │   │   └── models.py           # mongo document shape
│   │   │   ├── movies/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   ├── cinemas/
│   │   │   │   ├── router.py           # cinemas + screens
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   ├── shows/                  # showtime = movie x screen x date x time
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   ├── seats/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py          # lock/unlock logic via Redis
│   │   │   │   ├── websocket.py        # seat status broadcast
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   ├── booking/
│   │   │   │   ├── router.py
│   │   │   │   ├── service.py          # transactional booking creation
│   │   │   │   ├── schemas.py
│   │   │   │   └── models.py
│   │   │   └── payment/
│   │   │       ├── router.py
│   │   │       ├── service.py          # mock/real gateway integration
│   │   │       ├── schemas.py
│   │   │       └── models.py
│   │   └── common/
│   │       ├── exceptions.py
│   │       ├── pagination.py
│   │       └── utils.py
│   └── requirements.txt
│
├── docker-compose.yml
└── AGENT.md
```

---

## 4. Core Domain Model

The key relationship that must be modeled correctly:

```
Movie ──< Show >── Screen ──< Cinema
                     │
                     └── SeatLayout (per screen)

Show = { movie_id, cinema_id, screen_id, date, start_time, price_tiers }
```

A **Show** is the atomic bookable unit — it pins a movie to one screen, on one date, at one
time. This is what makes "different screens" and "different dates" work correctly: seat
availability, locks, and bookings are always scoped by `show_id`, never by movie or date alone.

### 4.1 MongoDB Collections

**`users`**
```json
{ "_id": ObjectId, "name": "", "email": "", "password_hash": "", "phone": "", "created_at": ISODate }
```

**`movies`**
```json
{
  "_id": ObjectId, "title": "", "language": [""], "genre": [""], "duration_mins": 0,
  "rating": "", "poster_url": "", "description": "", "release_date": ISODate, "is_active": true
}
```

**`cinemas`**
```json
{ "_id": ObjectId, "name": "", "city": "", "address": "", "screens": [ObjectId] }
```

**`screens`**
```json
{
  "_id": ObjectId, "cinema_id": ObjectId, "name": "Screen 1",
  "seat_layout": {
    "rows": [
      { "row": "A", "tier": "premium", "seats": ["A1","A2","A3", "..."] },
      { "row": "F", "tier": "regular", "seats": ["F1","F2", "..."] }
    ]
  }
}
```

**`shows`** — the pivot entity; unique per (screen, date, start_time)
```json
{
  "_id": ObjectId, "movie_id": ObjectId, "cinema_id": ObjectId, "screen_id": ObjectId,
  "date": "2026-08-20", "start_time": "19:30", "end_time": "22:00",
  "price_tiers": { "premium": 400, "regular": 220 },
  "booked_seats": ["A1", "A2", "F5"]
}
```
> Index: compound unique index on `{screen_id, date, start_time}` to prevent overlapping shows.
> Index: `{movie_id, cinema_id, date}` for the showtime lookup query.

**`seat_locks`** (Redis, not Mongo — TTL ~5-10 min)
```
key:   lock:{show_id}:{seat_id}
value: user_id
ttl:   600s
```
Redis is used (not Mongo) because locks need atomic, self-expiring holds while a user is on
the seat-selection/payment screen. Mongo is the source of truth for confirmed bookings only.

**`bookings`**
```json
{
  "_id": ObjectId, "user_id": ObjectId, "show_id": ObjectId, "seats": ["A1","A2"],
  "amount": 800, "status": "pending | confirmed | cancelled | expired",
  "payment_id": ObjectId, "created_at": ISODate
}
```

**`payments`**
```json
{ "_id": ObjectId, "booking_id": ObjectId, "amount": 0, "status": "success | failed", "provider_ref": "" }
```

---

## 5. Core Flows

### 5.1 Browse → Select Date → Select Screen/Showtime
1. `GET /movies` → list with filters (city, language, genre).
2. `GET /movies/{movie_id}` → details + list of cinemas showing it in the user's city.
3. `GET /shows?movie_id=&cinema_id=&date=` → returns showtimes grouped by screen for the
   **selected date**. Frontend renders a date-strip (next 7 days) + screen tabs; changing
   the date re-queries shows for that date only — this is what correctly separates
   "same movie, different date" from becoming a different show.
4. Selecting a showtime navigates to `booking/[showId]/seats`, scoped entirely by `show_id`.

### 5.2 Seat Selection & Locking
1. `GET /shows/{show_id}/seats` → merges the screen's static seat layout with `booked_seats`
   (confirmed) and currently active Redis locks (held by others) to compute per-seat status:
   `available | locked | booked`.
2. On seat click, frontend calls `POST /seats/lock` `{ show_id, seat_id }` → backend sets a
   Redis key with TTL and broadcasts the new seat status over WebSocket to everyone viewing
   that `show_id`'s seat map.
3. Lock auto-expires if the user abandons checkout; `DELETE /seats/lock` releases it early.

### 5.3 Booking & Payment
1. `POST /bookings` with `{ show_id, seats }` — backend re-validates that all seats are still
   locked by *this* user (not expired, not booked by someone else) before creating a
   `pending` booking. This must be an atomic check to avoid double-booking race conditions
   (use a Mongo transaction or a findOneAndUpdate with `$addToSet`/`$nin` guard on
   `shows.booked_seats`).
2. `POST /payments/{booking_id}` → mock/real gateway call.
3. On payment success: mark booking `confirmed`, push seats into `shows.booked_seats`,
   release the Redis locks, close the WebSocket hold.
4. On failure/timeout: booking → `cancelled`, locks released, seats become available again.

---

## 6. Concurrency & Correctness Notes
- **Never** trust the frontend's seat list at booking time — always re-check lock ownership
  and `shows.booked_seats` server-side.
- Use a Mongo transaction (or single atomic update) when moving seats from locked → booked so
  two simultaneous confirmations can't both succeed for the same seat.
- Seat status must be scoped by `show_id` everywhere (locks, booked_seats, WebSocket rooms) —
  this is what makes the same seat number valid across different dates/screens/showtimes.
- WebSocket room naming: `room:{show_id}` so seat-map updates don't leak across shows.

---

## 7. API Surface (summary)

| Method | Path                              | Purpose                          |
|--------|------------------------------------|-----------------------------------|
| POST   | /auth/signup, /auth/login          | Auth                              |
| GET    | /movies                            | List/filter movies                |
| GET    | /movies/{id}                       | Movie details                     |
| GET    | /cinemas?city=                     | List cinemas                      |
| GET    | /shows?movie_id=&cinema_id=&date=  | Showtimes for a date              |
| GET    | /shows/{show_id}/seats             | Seat map + status                 |
| POST   | /seats/lock / DELETE /seats/lock   | Hold/release a seat               |
| WS     | /ws/shows/{show_id}                | Live seat status                  |
| POST   | /bookings                          | Create pending booking            |
| POST   | /payments/{booking_id}             | Confirm payment                   |
| GET    | /bookings/me                       | User's booking history            |

---

## 8. Conventions
- Backend: async everywhere (Motor, async Redis client, async routes).
- Pydantic v2 schemas separate from Mongo document models; never return raw Mongo docs.
- Frontend: server components for read-only pages (movie listing, details); client components
  for interactive pieces (seat map, date picker, WebSocket-driven UI).
- Shared TypeScript types for API responses should mirror backend Pydantic schemas.
- All dates handled as `YYYY-MM-DD` strings at the API boundary; convert to `Date`/`ISODate`
  only inside each layer, never pass raw JS `Date` over the wire.
