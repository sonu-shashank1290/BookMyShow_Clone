# Learn this BookMyShow clone

Study guide for this repo. You already know **Node.js**. FastAPI and this booking domain are new. Read this top to bottom, then open the files it points to.

`AGENT.md` is the original full spec (Redis, Docker, WebSockets). **This project is the slim version:** Next.js + FastAPI + MongoDB. Seat holds are in memory. No Docker, no Redis, no WebSockets.

---

## 1. What you are building

A user:

1. Sees movies
2. Picks a **date** and a **screen/time** (that combo is a **Show**)
3. Locks seats
4. Creates a booking
5. Mock-pays
6. Seats become booked **only for that show**

The whole product hangs on one idea:

> **Show = movie + screen + date + time**  
> Seat `A1` is not unique. `A1` on Screen 1 today and `A1` on Screen 2 (or tomorrow) are different because they have different `show_id`s.

---

## 2. Node.js → this stack

| You know (Node) | Here |
|-----------------|------|
| `express()` | `FastAPI()` in `backend/app/main.py` |
| `app.use('/auth', router)` | `app.include_router(auth_router)` |
| middleware (`req.user`) | `Depends(get_current_user_id)` |
| zod / joi | Pydantic `schemas.py` |
| mongoose / mongodb driver | **Motor** (`db.users.find_one`) |
| `process.env` | `Settings` in `core/config.py` |
| `async/await` | `async def` + `await` (same idea) |
| axios | `frontend/src/common/lib/api.ts` |
| React context / Redux | `AuthProvider` |
| Next.js pages | App Router: `frontend/src/app/...` |

`async` is like Node’s event loop: while Mongo is working, the server can handle other requests.

---

## 3. Keyword glossary

Memorize these. They show up in every file.

### Python / FastAPI

| Keyword | Meaning |
|---------|---------|
| **FastAPI** | Web framework. Routes are functions with decorators like `@router.post("/login")`. |
| **uvicorn** | Process that runs the FastAPI app. Like `node server.js`. Command: `uvicorn app.main:app --reload`. |
| **`app`** | The FastAPI instance exported from `main.py`. Uvicorn loads `app.main:app`. |
| **router / APIRouter** | A mini-app of related URLs. Auth router prefix is `/auth`. |
| **`include_router`** | Mounts a feature router on the main app. |
| **path operation** | One HTTP endpoint (`GET /movies/{id}`). |
| **decorator** | `@router.get("")` attaches a function to a URL. |
| **Pydantic / BaseModel** | Class that validates JSON in/out. Bad body → `422`. |
| **`response_model`** | FastAPI only returns fields on that model (strips `password_hash`). |
| **`Depends()`** | Dependency injection. Like middleware that returns a value (`db`, `user_id`). |
| **`HTTPBearer`** | Reads `Authorization: Bearer <jwt>`. |
| **lifespan** | Startup/shutdown hook. We connect Mongo, then close it. |
| **CORS** | Browser rule. Frontend `:3000` may call API `:8000` because we allow it. |
| **`async def` / `await`** | Non-blocking I/O. Always `await` Motor calls. |
| **raise** | Throw an error. `raise NotFoundError(...)` → JSON `{ "detail": "..." }`. |
| **type hint** | `user_id: str`. FastAPI uses this to parse/inject. |
| **`Optional[str]`** | `string \| null`. Used because this machine is Python 3.9 (`X \| None` in FastAPI deps can break). |

### Auth / security

| Keyword | Meaning |
|---------|---------|
| **JWT** | Signed token. Payload has `sub` (user id), `type: access`, `exp`. |
| **`sub`** | Subject = user `_id` as a string. |
| **bcrypt** | Hashes passwords. We never store plain passwords. |
| **access token** | The only token we use. Stored in browser `localStorage` as `bms_token`. |
| **Bearer** | Header format: `Authorization: Bearer eyJ...` |

### Mongo / Motor

| Keyword | Meaning |
|---------|---------|
| **MongoDB** | Document database. Collections ≈ tables. |
| **collection** | `users`, `movies`, `shows`, `bookings`, … |
| **document** | One JSON-like row. |
| **Motor** | Async Mongo driver. `db.movies.find_one(...)`. |
| **ObjectId** | 24-hex Mongo id. API uses **strings**; queries need `ObjectId`. |
| **`to_object_id`** | Helper: string → ObjectId, or `400 Invalid id`. |
| **index** | Speeds lookups. Unique index on `users.email` and on shows `(screen_id, date, start_time)`. |
| **`$nin`** | “none of these values are already in the array”. Used so two payments cannot book the same seats. |
| **`$addToSet` / `$each`** | Add seats to `booked_seats` without duplicates. |
| **`find_one_and_update`** | Atomic read+write. Either the update happens or it doesn’t. |
| **seed** | Insert sample movies/cinemas/shows if the DB is empty. |

### Domain (the assignment)

| Keyword | Meaning |
|---------|---------|
| **Movie** | Title, language, genre, poster. Not bookable by itself. |
| **Cinema** | Theatre in a city (PVR, INOX). |
| **Screen** | Hall inside a cinema + **seat_layout** (rows A, B, …). |
| **Show** | The bookable unit: movie + screen + date + time + prices. |
| **`show_id`** | Scope for locks, booked seats, and bookings. Always. |
| **seat_layout** | Static map: row `A`, tier `premium`, seats `["A1","A2",...]`. |
| **tier** | `premium` or `regular`. Price comes from `show.price_tiers`. |
| **lock** | Temporary hold while choosing seats. **Not** in Mongo. |
| **TTL** | Time to live. Locks expire after 600 seconds. |
| **`booked_seats`** | Confirmed seats on that **show** document. This **is** in Mongo. |
| **pending / confirmed / cancelled / expired** | Booking statuses. |

### Frontend

| Keyword | Meaning |
|---------|---------|
| **Next.js App Router** | Folders under `src/app` are URLs. `movies/[movieId]/page.tsx` → `/movies/abc`. |
| **Server Component** | Default page. No `"use client"`. Cannot use hooks. |
| **Client Component** | `"use client"` at top. Needed for clicks, `useState`, context. |
| **`useParams`** | Read `[movieId]` from the URL. |
| **Context** | `AuthProvider` shares `user` + `token` without prop drilling. |
| **Tailwind** | Utility CSS: `bg-[#f84464]` is BookMyShow pink. |

---

## 4. Repo map

```
BookMyShow_Clone/
├── LEARN.md                 ← this file
├── AGENT.md                 ← original full spec (more than we built)
├── .env                     ← Mongo URI, JWT secret, CORS
│
├── backend/
│   ├── requirements.txt
│   ├── .venv/               ← Python packages (do not commit)
│   └── app/
│       ├── main.py          ← Express `app.js`
│       ├── core/            ← config, db, jwt, deps
│       ├── common/          ← errors, seed, ObjectId helper
│       └── features/        ← one folder per domain
│           ├── auth/
│           ├── movies/
│           ├── cinemas/
│           ├── shows/
│           ├── seats/
│           ├── booking/
│           └── payment/
│
└── frontend/
    └── src/
        ├── app/             ← routes (pages)
        ├── common/          ← api client, header
        └── features/        ← api + components + types per domain
```

### How to read one backend feature

Always this order:

1. `router.py` — URLs
2. `schemas.py` — JSON shape
3. `service.py` — rules + Mongo
4. `models.py` — Mongo doc → public JSON (`_id` → `id`)

Router must stay thin. Business logic lives in service.

---

## 5. How the server starts

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

1. Uvicorn imports `app` from `app/main.py`.
2. **Lifespan** runs `connect_db()`:
   - Motor client → `mongodb://localhost:27017`
   - Ping Mongo
   - `ensure_indexes()`
   - `seed_if_empty()` if movies/shows are missing
3. Routers are mounted.
4. CORS allows `http://localhost:3000`.
5. Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

`GET /health` → `{"status":"ok","mongo":"ok"}`.

Mongo in this project is a local binary (not Homebrew):

```bash
./.tools/mongodb-macos-x86_64-7.0.21/bin/mongod \
  --dbpath .data/mongo --port 27017 --bind_ip 127.0.0.1
```

---

## 6. Architecture (request path)

```
Browser (Next.js :3000)
    │  fetch + optional Bearer token
    ▼
FastAPI router          validate body (Pydantic)
    │
    ▼
Depends(get_db)         inject Motor database
Depends(get_current_user_id)   if route is protected
    │
    ▼
service.py              rules
    │
    ├─ Mongo collections   (users, shows, bookings, …)
    └─ seats/locks.py      (in-memory holds only)
    │
    ▼
schemas / models        public JSON (never raw Mongo)
```

### What is saved in Mongo vs not

| Saved in Mongo | Not in Mongo |
|----------------|--------------|
| users, movies, cinemas, screens, shows | seat **locks** (Python dict) |
| bookings, payments | |
| `shows.booked_seats` after **successful pay** | |

Restart the API → locks die. Confirmed seats stay.

---

## 7. Core files (backend)

### `main.py` — app factory

Creates `FastAPI`, lifespan, CORS, mounts every feature router, `/health`.

### `core/config.py` — env

Reads repo-root `.env`. Fields: `mongodb_uri`, `mongodb_db`, `jwt_secret`, `access_token_expire_minutes`, `cors_origins`.

### `core/database.py`

- `connect_db` / `close_db` / `get_database`
- Unique index: **one show per screen + date + start_time**
- Lookup index: `movie_id + cinema_id + date`

### `core/security.py`

- `hash_password` / `verify_password` (bcrypt)
- `create_access_token(user_id)`
- `decode_token` → payload or 401

### `core/deps.py` — like Express auth middleware

```python
async def get_db():
    return get_database()

async def get_current_user_id(...):   # required JWT
async def get_optional_user_id(...):  # seat map can be public
```

`get_db` does **not** save data. It only hands the DB into the route.

### `common/exceptions.py`

`BadRequestError(400)`, `UnauthorizedError(401)`, `ForbiddenError(403)`, `NotFoundError(404)`, `ConflictError(409)`. One handler turns them into `{ "detail": "..." }`.

### `common/utils.py`

`to_object_id(str)`, `oid_str(_id)`.

### `common/seed.py`

Stable ids so you can curl the same movie/show:

| Thing | Id |
|-------|-----|
| Interstellar | `64a000000000000000000001` |
| Jawan | `64a000000000000000000002` |
| 12th Fail | `64a000000000000000000003` |
| PVR | `64b000000000000000000001` |
| PVR Screen 1 / 2 | `64c000...0001` / `0002` |
| Interstellar PVR S1 today 16:00 | `64d000000000000000000001` |
| Interstellar PVR S1 today 19:30 | `64d000000000000000000002` |
| Interstellar PVR S2 today 19:30 | `64d000000000000000000003` |
| Interstellar PVR S1 tomorrow 19:30 | `64d000000000000000000004` |

Same movie, two screens, same clock time → **two show ids**. Same screen, tomorrow → **third show id**.

---

## 8. Features (backend)

### Auth — `features/auth/`

| Method | Path | Auth? |
|--------|------|-------|
| POST | `/auth/signup` | no |
| POST | `/auth/login` | no |
| GET | `/auth/me` | JWT |

**signup:** lowercase email → reject duplicate → bcrypt hash → insert `users` → JWT.  
**login:** find by email → verify password → JWT.  
**me:** decode JWT `sub` → load user.

Never return `password_hash`. `user_public()` in `models.py` builds `{ id, name, email, phone }`.

### Movies — `features/movies/`

| Method | Path |
|--------|------|
| GET | `/movies?language=&genre=` |
| GET | `/movies/{id}?city=Bengaluru` |

List is paginated. Detail also returns **cinemas that have at least one show** for that movie (`cinemas_for_movie` in shows service).

### Cinemas — `features/cinemas/`

| Method | Path |
|--------|------|
| GET | `/cinemas?city=` |
| GET | `/cinemas/{id}` |

Detail includes screens + `seat_layout`.

### Shows — `features/shows/`  (most important)

| Method | Path |
|--------|------|
| GET | `/shows?movie_id=&date=&cinema_id=` |
| GET | `/shows/{show_id}` |

List is **grouped**: cinema → screen → showtimes. Changing the date calls this again. That is how “different date = different show” is exposed to the UI.

### Seats — `features/seats/`

| Method | Path | Auth? |
|--------|------|-------|
| GET | `/shows/{show_id}/seats` | optional (for `locked_by_me`) |
| POST | `/seats/lock` | JWT |
| DELETE | `/seats/lock?show_id=&seat_id=` | JWT |

Seat status = merge of:

1. Screen layout (always)
2. `show.booked_seats` → `booked`
3. In-memory lock → `locked` (and `locked_by_me` if you hold it)
4. Else → `available`

`locks.py` key is `(show_id, seat_id)`. Locking `A1` on show 2 does not block `A1` on show 3.

### Booking + payment

| Method | Path | Auth? |
|--------|------|-------|
| POST | `/bookings` | JWT |
| GET | `/bookings/me` | JWT |
| POST | `/payments/{booking_id}` | JWT |

**Create booking**

1. Deduplicate seat list
2. Load show + layout
3. Reject if any seat already in `booked_seats`
4. Reject if you do not **currently hold locks** for all of them
5. Price = sum of `price_tiers[row.tier]`
6. Insert booking `status: pending`  
   Seats are **not** written to Mongo yet.

**Pay `{ "success": true }`**

1. Re-check locks still yours
2. Atomic:

```python
db.shows.find_one_and_update(
    { "_id": show_id, "booked_seats": { "$nin": seats } },
    { "$addToSet": { "booked_seats": { "$each": seats } } },
)
```

If this returns `None`, another confirm won the race → booking `cancelled`.

3. Booking → `confirmed`, payment `success`, locks released.

**Pay `{ "success": false }`**

Booking → `cancelled`, locks released, seats stay available.

---

## 9. Frontend architecture

```
page.tsx (route)
  → feature component (MovieGrid, SeatMap, …)
      → feature api/*.ts
          → common/lib/api.ts   fetch(API_URL + path, { Authorization })
              → FastAPI
```

### Routes (`src/app`)

| URL | File | What |
|-----|------|------|
| `/` | `page.tsx` | Recommended movies |
| `/movies/[movieId]` | movie hero + about + date/showtimes |
| `/booking/[showId]/seats` | seat map |
| `/payment/[bookingId]` | mock pay |
| `/login` `/signup` | auth |
| `/my-bookings` | `GET /bookings/me` |

### Shared

- `common/lib/api.ts` — `api<T>(path, { method, body, token })`, throws `ApiError`
- `features/auth/store/auth-context.tsx` — login/signup/logout, persist JWT, `/auth/me` on refresh
- `Header` — logo, Bengaluru, Hi Guest / name

### UI theme

Light BookMyShow-style: page `#f5f5f5`, header white, accent `#f84464`. Movie detail hero is dark (like the real movie page). Seats: white + green border available, pink selected.

---

## 10. Full user flow (code trail)

1. Home `MovieGrid` → `GET /movies`
2. Click card → `/movies/{id}` → `GET /movies/{id}` + `GET /shows?movie_id=&date=`
3. Change date → same shows URL, new `date` → different `show_id`s
4. Click `19:30` → `/booking/{showId}/seats` → `GET /shows/{id}/seats`
5. Click seat → `POST /seats/lock` (or DELETE to unlock)
6. Pay → `POST /bookings` then `/payment/{bookingId}` → `POST /payments/{id}` `{ success: true }`
7. My bookings → `GET /bookings/me`

---

## 11. API cheat sheet

```
POST /auth/signup          { name, email, password }
POST /auth/login           { email, password }
GET  /auth/me              Bearer

GET  /movies
GET  /movies/{id}?city=Bengaluru
GET  /cinemas?city=Bengaluru
GET  /cinemas/{id}

GET  /shows?movie_id=&date=YYYY-MM-DD
GET  /shows/{show_id}
GET  /shows/{show_id}/seats

POST /seats/lock           { show_id, seat_id }     Bearer
DELETE /seats/lock?show_id=&seat_id=                Bearer

POST /bookings             { show_id, seats: [] }   Bearer
GET  /bookings/me                                   Bearer
POST /payments/{booking_id} { success: true|false } Bearer
```

---

## 12. How to run (every time)

Terminal 1 — Mongo (if not already running):

```bash
./.tools/mongodb-macos-x86_64-7.0.21/bin/mongod \
  --dbpath .data/mongo --port 27017 --bind_ip 127.0.0.1
```

Terminal 2 — API:

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Terminal 3 — UI:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 13. What to say in a viva / interview

1. **Feature folders**, not a global `controllers/` dump.
2. **Show is the bookable unit**; seats and bookings are always keyed by `show_id`.
3. **Unique index** on `(screen_id, date, start_time)` prevents two films in one hall at the same time.
4. **Locks are short-lived** (memory + TTL). **Mongo is source of truth** after payment.
5. **Never trust the frontend seat list** — re-check locks, then atomic `$nin` + `$addToSet`.
6. **Pydantic** validates I/O; **Depends** injects db/user; **Motor** is async Mongo.

---

## 14. File checklist (open these, in order)

Backend: `main.py` → `config.py` → `database.py` → `security.py` → `deps.py` → `exceptions.py` → `auth/router.py` + `service.py` → `shows/service.py` → `seats/locks.py` + `service.py` → `booking/service.py` → `payment/service.py` → `common/seed.py`

Frontend: `api.ts` → `auth-context.tsx` → `MovieGrid.tsx` → `MovieShowtimes.tsx` → `SeatMap.tsx` → `booking.ts`

Do not memorize every line. Memorize **the path of one request** and **why `show_id` exists**.
