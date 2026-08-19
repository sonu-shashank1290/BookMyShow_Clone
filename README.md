# BookMyShow Clone

A movie ticket booking app: browse movies, pick a date and showtime, hold seats, and pay.

Built with **Next.js** (App Router + TypeScript + Tailwind) on the front and **FastAPI** +
**MongoDB** on the back, organized by feature on both sides.

---

## The core idea

A movie is not bookable. A cinema is not bookable. The only bookable unit is a **Show**:

> **Show = movie + screen + date + time**

A show also carries its own `language` and `format`, because those are properties of the
screening rather than the film: the same movie can play Telugu 2D at 10:15 and Hindi IMAX
at 13:45 in the same hall.

Seat `A1` is not unique — `A1` on Screen 1 tonight and `A1` on Screen 2 (or tomorrow) are
different seats because they belong to different shows. Every seat hold, every booked seat,
and every booking is scoped by `show_id`.

```
Movie ──< Show >── Screen ──< Cinema
             │        │
             │        └── seat_layout   (static: which seats exist)
             │
             └── booked_seats           (confirmed seats, per show)
```

---

## Features

- Browse movies with posters, ratings, cast, and language/format options
- **City switcher** across 18 cities with a "detect my location" option — the choice is
  remembered and filters the catalogue, the cinema list and every showtime
- 7-day date strip; showtimes grouped by cinema and screen
- Filter showtimes by language and format (a Telugu 2D show and a Hindi IMAX show of the
  same film are separate shows, so the filter narrows real results)
- Interactive seat map with tiered pricing (`classic`, `prime`, `recliner`, …)
- Pick a ticket quantity and auto-select adjacent seats in a row
- **Seat holds** with a 10-minute TTL so two people cannot grab the same seat mid-checkout
- Atomic seat confirmation — a concurrent payment for the same seat is rejected, not
  silently double-booked
- JWT auth (bcrypt passwords), booking history, mock payment with success/failure paths
- **M-Ticket** after a successful payment: unique `BMS-` booking ID plus a QR code the cinema could scan

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS 4 |
| Backend | FastAPI, Python 3.9+ |
| Database | MongoDB via Motor (async driver) |
| Auth | JWT access token, bcrypt password hashing |
| Seat locks | In-process store with TTL |
| Payments | Mock gateway |

---

## Quick start

**Prerequisites:** Python 3.9+, Node.js 18+, and a local MongoDB on port 27017.

```bash
git clone https://github.com/sonu-shashank1290/BookMyShow_Clone.git
cd BookMyShow_Clone
cp .env.example .env
```

**1. MongoDB** — any local instance works:

```bash
mongod --dbpath /your/data/path --port 27017
```

**2. Backend** → <http://localhost:8000> (interactive docs at `/docs`):

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**3. Frontend** → <http://localhost:3000>:

```bash
cd frontend
npm install
npm run dev
```

On first boot the API creates its indexes and seeds sample movies, cinemas, screens, and a
week of showtimes, so the app has data immediately. Check `GET /health` if anything looks
empty — it reports whether Mongo is reachable.

---

## Configuration

Copy `.env.example` to `.env` at the repo root. Both services read from it.

| Variable | Default | Purpose |
|----------|---------|---------|
| `MONGODB_URI` | `mongodb://localhost:27017` | Mongo connection |
| `MONGODB_DB` | `bookmyshow` | Database name |
| `JWT_SECRET` | `change-me-in-production` | Token signing key |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token lifetime |
| `CORS_ORIGINS` | `http://localhost:3000` | Allowed browser origin |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | API base URL for the frontend |

---

## Project structure

```
BookMyShow_Clone/
├── backend/app/
│   ├── main.py            # FastAPI app, lifespan, CORS, /health
│   ├── core/              # config, database, security, dependencies
│   ├── common/            # exceptions, pagination, seed data, helpers
│   └── features/          # auth, movies, cinemas, shows, seats, booking, payment
│                          #   each: router.py → schemas.py → service.py → models.py
└── frontend/src/
    ├── app/               # App Router — routes only
    ├── common/            # API client, date helpers, Header/Footer
    └── features/          # auth, city, movies, shows, seats, booking
                           #   each: api/ + components/ + types.ts
```

Both sides are grouped **by feature, not by technical layer** — a feature folder can be
deleted without breaking unrelated ones. Routers stay thin; business rules live in services.
Frontend types mirror the backend's Pydantic schemas field for field.

---

## API overview

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/signup`, `/auth/login` | — | Returns a JWT |
| GET | `/auth/me` | JWT | Current user |
| GET | `/movies?city=&premiere=`, `/movies/{id}?city=` | — | Catalog and details |
| GET | `/cities` | — | Cities that have cinemas |
| GET | `/cinemas`, `/cinemas/{id}` | — | Cinemas and screens |
| GET | `/shows?movie_id=&date=&city=&language=&format=` | — | Showtimes grouped by cinema and screen |
| GET | `/shows/{id}/seats` | optional | Seat map with per-seat status |
| POST / DELETE | `/seats/lock` | JWT | Hold or release a seat |
| POST | `/bookings` | JWT | Create a pending booking |
| GET | `/bookings/me` | JWT | Booking history |
| POST | `/payments/{booking_id}` | JWT | Mock pay — confirms or cancels |

Full interactive reference at <http://localhost:8000/docs> once the backend is running.

---

## How a booking stays correct

The interesting part of this project is that two people can be looking at the same seat map
at the same time. Three layers keep that safe:

1. **Hold** — clicking a seat takes a lock keyed by `(show_id, seat_id)` with a 10-minute
   TTL. Another user clicking the same seat gets a `409`. Abandoned checkouts expire on
   their own.
2. **Re-validate** — creating a booking never trusts the seat list sent by the browser. The
   server re-checks that the caller currently holds every lock and that no seat is already
   sold.
3. **Claim atomically** — payment confirms seats with a single conditional update:

   ```python
   db.shows.find_one_and_update(
       {"_id": show_id, "booked_seats": {"$nin": seats}},
       {"$addToSet": {"booked_seats": {"$each": seats}}},
   )
   ```

   It either claims every seat or none. If a concurrent payment won the race, this returns
   nothing and the losing booking is cancelled rather than double-selling the seat.

A unique index on `(screen_id, date, start_time)` separately guarantees two films can never
be scheduled in the same hall at the same time.

---

## Scope

This is a portfolio build focused on the booking domain, so a few production concerns are
intentionally out of scope: seat locks live in process memory rather than Redis, the seat map
refreshes on demand instead of over a WebSocket, payments are mocked, and there is no
container setup. `AGENT.md` documents each omission alongside how it would be implemented.

---

## Documentation

- **`AGENT.md`** — architecture, data model, indexes, request flows, and conventions.
