# AGENT.md — BookMyShow Clone

Source of truth for this repo: tech stack, architecture, feature boundaries, data models, and
core flows. Any agent (human or AI) working here should read this before writing code.

This describes **what is actually built**, not an aspirational spec. Section 10 lists the
deliberate omissions and how they would be added.

---

## 1. Tech Stack

| Layer      | Choice                                          |
|------------|-------------------------------------------------|
| Frontend   | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| Backend    | FastAPI, Python 3.9+                            |
| Database   | MongoDB (Motor async driver)                    |
| Auth       | JWT access token only (30 min), bcrypt passwords |
| Seat locks | In-process Python dict with TTL — **not** Redis  |
| Payments   | Mock gateway (`{ success: true \| false }`)      |
| Deployment | Local dev only — no Docker, no compose file      |

Python 3.9 compatibility matters: use `Optional[str]`, not `str | None`, in FastAPI
dependency and route signatures.

---

## 2. Architecture Principle: Feature-Based

Both sides are organized **by feature/domain**, not by technical layer. Each feature owns its
own routes/services/components and types. Shared code lives in `common/` (and `core/` on the
backend). No global `models/`, `controllers/`, or `components/` dumping ground — a feature
folder should be deletable without breaking unrelated features.

Backend feature files, always in this order:

1. `router.py` — URLs and dependencies. Thin. No business rules.
2. `schemas.py` — Pydantic request/response models.
3. `service.py` — rules + Mongo queries.
4. `models.py` — Mongo document → public JSON (`_id` → `id`, strip secrets).

---

## 3. Repo Structure

```
BookMyShow_Clone/
├── .env                     # real config, git-ignored
├── .env.example             # committed template
├── AGENT.md
│
├── backend/
│   ├── requirements.txt
│   ├── .venv/               # git-ignored
│   └── app/
│       ├── main.py                  # FastAPI app, lifespan, CORS, /health
│       ├── core/
│       │   ├── config.py            # pydantic-settings, reads root .env
│       │   ├── database.py          # Motor client, indexes, seed
│       │   ├── security.py          # bcrypt + JWT
│       │   └── deps.py              # get_db, get_current_user_id, get_optional_user_id
│       ├── common/
│       │   ├── exceptions.py        # AppError → { "detail": ... }
│       │   ├── pagination.py
│       │   ├── seed.py              # sample movies/cinemas/screens/shows
│       │   └── utils.py             # to_object_id, oid_str
│       └── features/
│           ├── auth/                # router, schemas, service, models
│           ├── movies/
│           ├── cinemas/             # cinemas + screens + seat_layout + /cities
│           ├── shows/               # movie x screen x date x time
│           ├── seats/               # router, schemas, service, locks.py
│           ├── booking/
│           └── payment/
│
└── frontend/
    ├── package.json
    └── src/
        ├── app/                              # App Router: routes only, thin
        │   ├── layout.tsx                    # Providers + Header + Footer
        │   ├── page.tsx                      # home
        │   ├── (auth)/login/page.tsx
        │   ├── (auth)/signup/page.tsx
        │   ├── movies/[movieId]/page.tsx
        │   ├── movies/[movieId]/buytickets/page.tsx
        │   ├── booking/[showId]/seats/page.tsx
        │   ├── payment/[bookingId]/page.tsx
        │   ├── payment/[bookingId]/confirmed/page.tsx
        │   └── my-bookings/page.tsx
        ├── common/
        │   ├── components/                   # Header, Footer, Icons, BrandLogo, ApiHealth
        │   └── lib/                          # api.ts (fetch client), dates.ts
        └── features/
            ├── auth/       api/, components/AuthForm, store/auth-context
            ├── city/       api/, components/CityModal + CityIcon, lib/geo, store/city-context
            ├── movies/     api/, components/MovieGrid, MovieCard, LanguageFormatModal, types
            ├── shows/      api/, components/MovieShowtimes, DateStrip, ShowtimeGrid, types
            ├── seats/      api/, components/SeatMap, SeatCountModal, lib/continuous, types
            ├── booking/    api/booking.ts (bookings + payments), types
            ├── cinemas/    types only — cinema data arrives inside show responses
            └── payment/    types only — payment calls live in booking/api
```

Note: `backend/app/features/seats/` has **no** `models.py`. The seat map is composed in
`service.py` from the screen layout, the show, and the lock store.

---

## 4. Core Domain Model

```
Movie ──< Show >── Screen ──< Cinema
             │        │
             │        └── seat_layout (static, per screen)
             │
             └── booked_seats (confirmed, per show)

Show = { movie_id, cinema_id, screen_id, date, start_time, price_tiers }
```

A **Show** is the atomic bookable unit — it pins a movie to one screen, on one date, at one
time. Seat availability, locks, and bookings are always scoped by `show_id`, never by movie
or date alone. Seat `A1` on Screen 1 today and `A1` on Screen 2 (or tomorrow) are different
seats because they have different `show_id`s.

### 4.1 MongoDB Collections

Database: `bookmyshow`. Seven collections. Seat locks are **not** one of them.

**`users`**
```json
{ "_id": ObjectId, "name": "", "email": "", "password_hash": "", "phone": "", "created_at": ISODate }
```

**`movies`**
```json
{
  "_id": ObjectId, "title": "", "language": [""], "genre": [""], "duration_mins": 0,
  "rating": "", "poster_url": "", "backdrop_url": "", "description": "",
  "release_date": "2026-08-14", "vote_average": 0, "vote_count": 0,
  "formats": ["2D"], "language_formats": { "Hindi": ["2D"] },
  "cast": [{ "name": "", "role": "", "photo_url": "" }], "crew": [],
  "sort_order": 0, "is_active": true
}
```

**`cinemas`**
```json
{ "_id": ObjectId, "name": "", "city": "", "address": "", "amenities": [""] }
```
Screens are **not** embedded as an id array; they are queried by `cinema_id`.

**`screens`**
```json
{
  "_id": ObjectId, "cinema_id": ObjectId, "name": "Screen 1",
  "seat_layout": {
    "rows": [
      { "row": "A", "tier": "classic_plus", "seats": ["A1", "A2", "..."] },
      { "row": "L", "tier": "recliner",     "seats": ["L1", "..."] }
    ]
  }
}
```
Tiers in seeded data: `classic_plus`, `classic`, `prime`, `recliner`. The layout is static
furniture — it never records availability.

**`shows`** — the pivot entity
```json
{
  "_id": ObjectId, "movie_id": ObjectId, "cinema_id": ObjectId, "screen_id": ObjectId,
  "city": "Hyderabad", "language": "Telugu", "format": "2D",
  "date": "2026-08-20", "start_time": "19:30", "end_time": "22:00",
  "price_tiers": { "classic": 199, "prime": 199, "recliner": 399 },
  "booked_seats": ["A1", "A2", "F5"]
}
```
`booked_seats` is written **only** after a successful payment.

`language` and `format` live on the show, not the movie: one film screens in Telugu
2D at 10:15 and Hindi IMAX at 13:45, and those are different shows. `city` is
denormalised from the cinema so the showtimes query stays a single-collection read —
a show never changes venue, so the copy cannot drift.

**`bookings`**
```json
{
  "_id": ObjectId, "user_id": ObjectId, "show_id": ObjectId, "seats": ["A1", "A2"],
  "amount": 800, "status": "pending | confirmed | cancelled | expired",
  "payment_id": ObjectId, "created_at": ISODate
}
```

**`payments`**
```json
{ "_id": ObjectId, "booking_id": ObjectId, "amount": 0, "status": "success | failed", "provider_ref": "mock_..." }
```

### 4.2 Indexes (`core/database.py` → `ensure_indexes`)

| Index | Type | Purpose |
|-------|------|---------|
| `users.email` | unique | one account per email |
| `shows (screen_id, date, start_time)` | unique compound | no two films in one hall at one time |
| `shows (movie_id, cinema_id, date)` | lookup | showtimes for one cinema |
| `shows (movie_id, city, date)` | lookup | the showtime query the UI actually makes |
| `cinemas.city` | lookup | city filter |
| `movies.language`, `movies.genre` | lookup | catalog filters |

### 4.3 Seat locks — in-memory, not a collection

`backend/app/features/seats/locks.py`:

```
key:   (show_id, seat_id)          # tuple, module-level dict
value: { "user_id": str, "expires_at": datetime }
ttl:   TTL_SECONDS = 600
```

Guarded by a `threading.Lock`; expired entries are purged lazily on read. Holds must expire
by themselves while a user sits on the seat/payment screen, so they do not belong in Mongo.
Mongo is the source of truth for **confirmed** bookings only.

Consequence to remember: locks are process-local. Restarting the API drops every hold, and
running multiple workers would not share them. See section 10.

---

## 5. Core Flows

### 5.1 Browse → Select Date → Select Showtime
0. `GET /cities` → the cities that have cinemas, popular ones first in a curated order
   (`POPULAR_CITIES` in the cinemas service — merchandising, not something to derive from
   cinema counts). The chosen city lives in a React context backed by `localStorage`
   (`bms_city`) and is threaded into every catalogue call below, so switching city changes
   what the whole app shows. "Detect my location" snaps the browser coordinate to the
   nearest city in `features/city/lib/geo.ts` — no geocoding service involved.
1. `GET /movies?city=&premiere=` → paginated list. `city` keeps the grid to films that
   actually have shows there; `premiere` splits the home page's two rows into disjoint sets.
2. `GET /movies/{movie_id}?city=` → details plus `cinemas`, derived from `shows.distinct("cinema_id")`.
3. `GET /shows?movie_id=&date=&city=&language=&format=` → showtimes grouped
   **cinema → screen → showtimes** for the selected date, plus the `languages` and `formats`
   available that day so the UI can render real filter chips. Those options are computed
   before the language/format filter is applied, so the chips never vanish once you pick one.
   The frontend renders a 7-day date strip; changing the date re-queries for that date only.
   That is what keeps "same movie, different date" a different show.
4. Selecting a showtime navigates to `/booking/[showId]/seats`, scoped entirely by `show_id`.

### 5.2 Seat Selection & Locking
1. `GET /shows/{show_id}/seats` merges three sources into per-seat status:
   screen `seat_layout` (which seats exist) + `shows.booked_seats` → `booked` + active
   in-memory locks → `locked`, plus `locked_by_me` when the caller holds it. Auth is optional
   here so guests can view the map.
2. Seat click → `POST /seats/lock` `{ show_id, seat_id }` (JWT). Returns `expires_in: 600`.
   A seat held by another user returns `409`.
3. `DELETE /seats/lock?show_id=&seat_id=` releases early; otherwise the hold expires on its own.
4. The frontend refetches the map after each lock/unlock. There is no push channel.

### 5.3 Booking & Payment
1. `POST /bookings` `{ show_id, seats }` — server-side revalidation: dedupe seats, reject any
   seat already in `booked_seats`, reject unless the caller currently holds **every** lock,
   then price from `price_tiers[row.tier]` and insert `status: "pending"`. Seats are **not**
   written to Mongo at this point.
2. `POST /payments/{booking_id}` `{ success }` — mock gateway.
3. On success: re-check lock ownership (else booking → `expired`), then one atomic guard:

   ```python
   db.shows.find_one_and_update(
       {"_id": show_id, "booked_seats": {"$nin": seats}},
       {"$addToSet": {"booked_seats": {"$each": seats}}},
   )
   ```

   `None` means a concurrent confirmation won → booking `cancelled`. Otherwise booking →
   `confirmed`, a unique `ticket_code` (`BMS-XXXXXXXX`) is minted, `payment_id` attached,
   locks released. The confirmation page renders that as an M-Ticket with a QR encoding
   `{ code, booking_id, show_id, seats }`.
4. On failure: payment `failed`, booking `cancelled`, locks released, seats free again.
5. `DELETE /bookings/{booking_id}` discards a **pending** booking (payment-page back button)
   and releases its locks.

---

## 6. Concurrency & Correctness Notes

- **Never** trust the frontend's seat list at booking time — always re-check lock ownership
  and `shows.booked_seats` server-side.
- The `$nin` + `$addToSet` update is the single atomic step that moves seats locked → booked,
  so two simultaneous confirmations cannot both succeed. No Mongo transaction is needed
  because it is one document update.
- Seat status is scoped by `show_id` everywhere (locks, `booked_seats`, bookings) — this is
  what makes the same seat number valid across different dates/screens/showtimes.
- Continuous-seat selection (`features/seats/lib/continuous.ts`) is a **frontend convenience**.
  The server locks one seat at a time and never assumes adjacency.

---

## 7. API Surface

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/signup` | — | Create account, returns JWT |
| POST | `/auth/login` | — | Returns JWT |
| GET | `/auth/me` | JWT | Current user |
| GET | `/movies?language=&genre=&city=&premiere=&page=&page_size=` | — | List/filter movies |
| GET | `/movies/{id}?city=` | — | Details + cinemas playing it |
| GET | `/cities` | — | Cities that have cinemas, with counts |
| GET | `/cinemas?city=` | — | List cinemas |
| GET | `/cinemas/{id}` | — | Cinema + screens + seat_layout |
| GET | `/shows?movie_id=&date=&cinema_id=&city=&language=&format=` | — | Showtimes grouped by cinema/screen |
| GET | `/shows/{show_id}` | — | One show, with movie/cinema/screen names |
| GET | `/shows/{show_id}/seats` | optional | Seat map + status |
| POST | `/seats/lock` | JWT | Hold a seat (TTL 600s) |
| DELETE | `/seats/lock?show_id=&seat_id=` | JWT | Release a seat |
| POST | `/bookings` | JWT | Create pending booking |
| GET | `/bookings/me` | JWT | Booking history |
| GET | `/bookings/{id}` | JWT | One booking (owner only) |
| DELETE | `/bookings/{id}` | JWT | Discard a pending booking |
| POST | `/payments/{booking_id}` | JWT | Mock pay, confirm or cancel |
| GET | `/health` | — | `{ status, mongo }` |

`date` is validated as `YYYY-MM-DD`. Errors are `{ "detail": "..." }` with status 400/401/403/404/409.

---

## 8. Conventions

- Backend: async everywhere (Motor, async routes). No sync DB calls.
- Pydantic v2 schemas stay separate from Mongo document shaping; never return raw Mongo docs.
  Always go through `models.py` and set `response_model` on the route.
- IDs cross the API boundary as **strings**; convert with `to_object_id` / `oid_str`.
- All dates cross the boundary as `YYYY-MM-DD` strings, times as `HH:MM`. Never send a raw
  JS `Date` or Python `datetime` over the wire.
- Frontend: `app/` holds routes only; feature folders hold UI, API calls, and types. Every
  network call goes through `common/lib/api.ts`, which attaches the bearer token and converts
  errors into `ApiError`.
- Client components (`"use client"`) for anything interactive — seat map, date strip, auth
  context, modals. Everything else stays a server component.
- Frontend types in `features/*/types.ts` mirror backend Pydantic schemas field for field.
- JWT is stored in `localStorage` under `bms_token` and rehydrated via `GET /auth/me`.
- The selected city is stored in `localStorage` under `bms_city`. `useCity()` returns
  `city: null` until that read happens on the client, and catalogue components skip
  fetching while it is null — that avoids a wasted request against the wrong city.

---

## 9. Running Locally

MongoDB is a local binary under `.tools/` writing to `.data/` (both git-ignored).

```bash
# 1. Mongo
./.tools/mongodb-macos-x86_64-7.0.21/bin/mongod \
  --dbpath .data/mongo --port 27017 --bind_ip 127.0.0.1

# 2. API  → http://localhost:8000  (docs at /docs)
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 3. UI   → http://localhost:3000
cd frontend && npm run dev
```

On startup the API pings Mongo, creates indexes, and seeds sample movies/cinemas/screens/shows
if the collections are empty. Seed ids are stable so the same movie/show can be curled
repeatedly. If Mongo is unreachable the API still boots and `/health` reports `503`.

---

## 10. Deliberate Omissions

Not built. If you add any of these, update this file in the same change.

| Not built | Current stand-in | How to add |
|-----------|------------------|------------|
| Redis locks | In-memory dict in `seats/locks.py` | `SET lock:{show}:{seat} {user} NX EX 600`; keeps holds shared across API replicas |
| WebSocket seat updates | Refetch the map after each lock/unlock | Socket room per `show_id`; broadcast seat status on lock/release/confirm |
| Refresh tokens | Access token only, 30 minutes | Add refresh token + rotation; keep `type` claim check in `deps.py` |
| Real payment gateway | `POST /payments/{id} { success }` | Provider SDK + webhook that drives `confirm_booking` |
| Docker Compose | Three local processes | Services for frontend, backend, mongo (and redis once added) |
| Cinema browse pages | Cinemas surface inside movie/show responses | `/cinemas` routes exist on the API already; the UI does not call them |
| Automated tests | Manual verification via `/docs` and the UI | pytest + httpx for services, Playwright for the booking flow |
