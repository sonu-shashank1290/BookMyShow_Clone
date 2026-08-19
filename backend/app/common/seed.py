from datetime import date, datetime, timedelta

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

# Stable ids so later show seeding can reference the same screens/movies.
MOVIE_INTERSTELLAR = ObjectId("64a000000000000000000001")
MOVIE_JAWAN = ObjectId("64a000000000000000000002")
MOVIE_TWELFTH_FAIL = ObjectId("64a000000000000000000003")
MOVIE_AWARAPAN = ObjectId("64a000000000000000000004")
MOVIE_STREE = ObjectId("64a000000000000000000005")
MOVIE_SPIDER = ObjectId("64a000000000000000000006")
MOVIE_KALKI = ObjectId("64a000000000000000000007")
MOVIE_ANIMAL = ObjectId("64a000000000000000000008")
MOVIE_DUNE = ObjectId("64a000000000000000000009")
MOVIE_OPPENHEIMER = ObjectId("64a00000000000000000000a")
MOVIE_PUSHPA = ObjectId("64a00000000000000000000b")
MOVIE_FIGHTER = ObjectId("64a00000000000000000000c")
MOVIE_VISHWANATH = ObjectId("64a00000000000000000000d")

CINEMA_PVR = ObjectId("64b000000000000000000001")
CINEMA_INOX = ObjectId("64b000000000000000000002")
CINEMA_NEXUS = ObjectId("64b000000000000000000003")
CINEMA_CINEPOLIS = ObjectId("64b000000000000000000004")
CINEMA_ORION = ObjectId("64b000000000000000000005")

SCREEN_PVR_1 = ObjectId("64c000000000000000000001")
SCREEN_PVR_2 = ObjectId("64c000000000000000000002")
SCREEN_INOX_1 = ObjectId("64c000000000000000000003")
SCREEN_NEXUS_1 = ObjectId("64c000000000000000000004")
SCREEN_NEXUS_2 = ObjectId("64c000000000000000000005")
SCREEN_CINEPOLIS_1 = ObjectId("64c000000000000000000006")
SCREEN_ORION_1 = ObjectId("64c000000000000000000007")

IMG = "https://image.tmdb.org/t/p"
DEFAULT_PRICES = {
    "classic_plus": 199,
    "classic": 199,
    "prime": 199,
    "recliner": 399,
}

CINEMA_SCREENS = {
    CINEMA_PVR: [SCREEN_PVR_1, SCREEN_PVR_2],
    CINEMA_INOX: [SCREEN_INOX_1],
    CINEMA_NEXUS: [SCREEN_NEXUS_1, SCREEN_NEXUS_2],
    CINEMA_CINEPOLIS: [SCREEN_CINEPOLIS_1],
    CINEMA_ORION: [SCREEN_ORION_1],
}


def _img(path, size="w500"):
    if path.startswith("http"):
        return path
    return "%s/%s%s" % (IMG, size, path)


def _poster(path):
    return _img(path, "w500")


def _backdrop(path):
    return _img(path, "w1280")


def _row(letter, tier, count):
    return {
        "row": letter,
        "tier": tier,
        "seats": ["%s%s" % (letter, i) for i in range(1, count + 1)],
    }


def _hall_layout():
    rows = []
    for letter in "AB":
        rows.append(_row(letter, "classic_plus", 12))
    for letter in "CDE":
        rows.append(_row(letter, "classic", 12))
    for letter in "FGHJK":
        rows.append(_row(letter, "prime", 12))
    rows.append(_row("L", "recliner", 8))
    return {"rows": rows}


def _compact_layout():
    return {
        "rows": [
            _row("A", "classic_plus", 8),
            _row("B", "classic", 10),
            _row("C", "classic", 10),
            _row("D", "prime", 10),
            _row("E", "prime", 10),
            _row("F", "recliner", 6),
        ]
    }


def _end_time(start_time, duration_mins):
    parsed = datetime.strptime(start_time, "%H:%M")
    ended = parsed + timedelta(minutes=duration_mins)
    return ended.strftime("%H:%M")


def _show(show_id, movie_id, cinema_id, screen_id, show_date, start_time, duration_mins):
    return {
        "_id": show_id,
        "movie_id": movie_id,
        "cinema_id": cinema_id,
        "screen_id": screen_id,
        "date": show_date.isoformat(),
        "start_time": start_time,
        "end_time": _end_time(start_time, duration_mins),
        "price_tiers": dict(DEFAULT_PRICES),
        "booked_seats": [],
    }


def _show_oid(n):
    return ObjectId("64d%021x" % n)


def _person(name, role, photo):
    return {"name": name, "role": role, "photo_url": photo}


def _movie(
    movie_id,
    title,
    language,
    genre,
    duration_mins,
    rating,
    poster,
    backdrop,
    description,
    release,
    vote_average,
    vote_count,
    formats=None,
    language_formats=None,
    cast=None,
    crew=None,
    sort_order=10,
):
    return {
        "_id": movie_id,
        "title": title,
        "language": language,
        "genre": genre,
        "duration_mins": duration_mins,
        "rating": rating,
        "poster_url": _poster(poster),
        "backdrop_url": _backdrop(backdrop),
        "description": description,
        "release_date": release.isoformat(),
        "vote_average": vote_average,
        "vote_count": vote_count,
        "formats": formats or ["2D"],
        "language_formats": language_formats or {lang: formats or ["2D"] for lang in language},
        "cast": cast or [],
        "crew": crew or [],
        "sort_order": sort_order,
        "is_active": True,
    }


MOVIES = [
    _movie(
        MOVIE_VISHWANATH,
        "Vishwanath and Sons",
        ["Tamil", "Telugu", "Malayalam", "Kannada", "Hindi"],
        ["Drama", "Family"],
        161,
        "UA",
        "/adDZVEQZnMJ380zPOmVj6vBWHgk.jpg",
        "/adDZVEQZnMJ380zPOmVj6vBWHgk.jpg",
        "An international shooter who has spent his life in pursuit of excellence, "
        "Sanjay Vishwanath finds his world upended by age, family duties, and an "
        "unexpected romance - forcing him to confront what truly matters.",
        date(2026, 8, 14),
        8.6,
        13500,
        formats=["2D", "DOLBY CINEMA 2D"],
        language_formats={
            "Tamil": ["2D"],
            "Telugu": ["DOLBY CINEMA 2D", "2D"],
            "Malayalam": ["2D"],
            "Kannada": ["2D"],
            "Hindi": ["2D"],
        },
        cast=[
            _person("Suriya", "as Sanjay Vishwanath", "https://i.pravatar.cc/150?img=12"),
            _person("Mamitha Baiju", "as Maddy", "https://i.pravatar.cc/150?img=32"),
            _person("Radhika Sarathkumar", "as Actor", "https://i.pravatar.cc/150?img=47"),
            _person("Raveena Tandon", "as Actor", "https://i.pravatar.cc/150?img=45"),
        ],
        crew=[
            _person("Venky Atluri", "Director", "https://i.pravatar.cc/150?img=15"),
            _person("G. V. Prakash Kumar", "Musician", "https://i.pravatar.cc/150?img=18"),
        ],
        sort_order=0,
    ),
    _movie(
        MOVIE_AWARAPAN,
        "Awarapan 2",
        ["Hindi"],
        ["Action", "Crime", "Romantic"],
        140,
        "UA16+",
        "/giSJJDEIJiAazo0gStmynBZoo4P.jpg",
        "/c9uavQMB6pLmh2GNfQGAjHSLWtY.jpg",
        "Drawn back into the underworld, Shivam finds his future hinging on "
        "redemption, love, and sacrifice. As bonds deepen and conflicts sharpen, "
        "each decision he makes tests his resolve and shapes the fate that awaits him.",
        date(2026, 8, 14),
        8.3,
        41900,
        cast=[
            _person("Emraan Hashmi", "as Shivam", "https://image.tmdb.org/t/p/w185/kflgvFCFZnpTRbKmJWn5T0G5EKI.jpg"),
            _person("Disha Patani", "as Actor", "https://image.tmdb.org/t/p/w185/oWfHKrvbk3Ak6UnrzDlAoZu7nlh.jpg"),
            _person("Shabana Azmi", "as Nafisa", "https://image.tmdb.org/t/p/w185/gy7DpFaZnpU4XOwBc8jhhE8rYYj.jpg"),
        ],
        crew=[
            _person("Nitin Kakkar", "Director", "https://i.pravatar.cc/150?img=14"),
        ],
        sort_order=1,
    ),
    _movie(
        MOVIE_STREE,
        "Stree 2",
        ["Hindi"],
        ["Horror", "Comedy"],
        149,
        "UA",
        "/2NC7sj8rheKxWqLYAbHnCa4mYBH.jpg",
        "/2NC7sj8rheKxWqLYAbHnCa4mYBH.jpg",
        "After the events in Chanderi, the town faces a new terror as women "
        "mysteriously disappear. The gang reunites to confront a fresh supernatural "
        "threat — this time targeting the women of Chanderi.",
        date(2024, 8, 15),
        7.6,
        128400,
    ),
    _movie(
        MOVIE_JAWAN,
        "Jawan",
        ["Hindi"],
        ["Action", "Thriller"],
        169,
        "UA",
        "/jFt1gS4BGHlK8xt76Y81Alp4dbt.jpg",
        "/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg",
        "A man is driven by a personal vendetta to rectify the wrongs in society, "
        "while keeping a promise made years ago. He recruits an army of feared women "
        "from a prison and takes down a dreaded gangster.",
        date(2023, 9, 7),
        7.2,
        186200,
    ),
    _movie(
        MOVIE_TWELFTH_FAIL,
        "12th Fail",
        ["Hindi"],
        ["Drama"],
        147,
        "U",
        "/u7BeOSx3bkXkFNlMg8Ik5h5Jpl8.jpg",
        "/kVqjgpcwvDJOhCupjcLzwwtOp52.jpg",
        "The real-life journey of Manoj Kumar Sharma, an IPS officer who failed "
        "his class 12 exams but refused to give up on the UPSC dream. A story of "
        "grit, second chances, and the people who stand by you.",
        date(2023, 10, 27),
        8.8,
        94200,
    ),
    _movie(
        MOVIE_SPIDER,
        "Spider-Man: Across the Spider-Verse",
        ["English"],
        ["Action", "Adventure", "Sci-Fi"],
        140,
        "U",
        "/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        "/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
        "Miles Morales catapults across the Multiverse, where he meets a team of "
        "Spider-People charged with protecting its very existence. When the heroes "
        "clash on how to handle a new threat, Miles must redefine what it means to "
        "be a hero.",
        date(2023, 6, 2),
        8.4,
        312000,
    ),
    _movie(
        MOVIE_KALKI,
        "Kalki 2898 AD",
        ["Telugu", "Hindi"],
        ["Action", "Sci-Fi", "Fantasy"],
        180,
        "UA",
        "/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
        "/rstcAnBeCkxNQjNp3YXrF6IP1tW.jpg",
        "A modern-day avatar of Vishnu, a god of Hindu mythology, is taken on an "
        "enthralling journey to fulfill his destiny amidst the battle of good vs evil "
        "in a dystopian future, 6000 years after the Mahabharata.",
        date(2024, 6, 27),
        7.4,
        156800,
    ),
    _movie(
        MOVIE_ANIMAL,
        "Animal",
        ["Hindi"],
        ["Action", "Crime", "Drama"],
        201,
        "A",
        "https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg",
        "https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg",
        "A son undergoes a remarkable transformation as the bond with his father "
        "begins to fracture. What starts as fierce loyalty spirals into a violent "
        "reckoning that tests every relationship around him.",
        date(2023, 12, 1),
        6.8,
        201500,
    ),
    _movie(
        MOVIE_DUNE,
        "Dune: Part Two",
        ["English"],
        ["Sci-Fi", "Adventure"],
        166,
        "UA",
        "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
        "/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
        "Paul Atreides unites with Chani and the Fremen while seeking revenge "
        "against the conspirators who destroyed his family. Facing a choice between "
        "the love of his life and the fate of the universe, he must prevent a terrible "
        "future only he can foresee.",
        date(2024, 3, 1),
        8.3,
        489000,
    ),
    _movie(
        MOVIE_OPPENHEIMER,
        "Oppenheimer",
        ["English"],
        ["Biography", "Drama", "History"],
        180,
        "UA",
        "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        "/fm6KqXPk3Du3QGd7TIFFB5bMnvM.jpg",
        "The story of American scientist J. Robert Oppenheimer and his role in "
        "the development of the atomic bomb, the pressure of war, and the personal "
        "cost of changing the world.",
        date(2023, 7, 21),
        8.2,
        612000,
    ),
    _movie(
        MOVIE_PUSHPA,
        "Pushpa 2: The Rule",
        ["Telugu", "Hindi"],
        ["Action", "Crime", "Thriller"],
        200,
        "UA",
        "/xkYGdKuK8jfqvGNCZV1uNdYkIfS.jpg",
        "/xkYGdKuK8jfqvGNCZV1uNdYkIfS.jpg",
        "Pushpa Raj returns, more powerful than ever, as he consolidates his "
        "red-sandalwood empire and goes head-to-head with those who want him brought "
        "down. The rule begins where the rise ended.",
        date(2024, 12, 5),
        7.5,
        274300,
    ),
    _movie(
        MOVIE_FIGHTER,
        "Fighter",
        ["Hindi"],
        ["Action", "Thriller"],
        166,
        "UA",
        "https://upload.wikimedia.org/wikipedia/en/d/df/Fighter_film_teaser.jpg",
        "https://upload.wikimedia.org/wikipedia/en/d/df/Fighter_film_teaser.jpg",
        "Top IAF aviators come together as the Air Dragon team to face a deadly "
        "new enemy. Between high-altitude combat and personal stakes on the ground, "
        "every sortie tests what they are willing to lose.",
        date(2024, 1, 25),
        6.9,
        87300,
    ),
    _movie(
        MOVIE_INTERSTELLAR,
        "Interstellar",
        ["English"],
        ["Sci-Fi", "Drama", "Adventure"],
        169,
        "UA",
        "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        "/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
        "When Earth becomes uninhabitable, a farmer and ex-NASA pilot, Joseph "
        "Cooper, is tasked to pilot a spaceship, along with a team of researchers, "
        "to find a new planet for humans.",
        date(2014, 11, 7),
        8.6,
        1980000,
    ),
]

CINEMAS = [
    {
        "_id": CINEMA_PVR,
        "name": "PVR: Phoenix Marketcity",
        "city": "Bengaluru",
        "address": "Whitefield, Bengaluru",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_PVR_1, SCREEN_PVR_2],
    },
    {
        "_id": CINEMA_INOX,
        "name": "INOX: Mantri Square",
        "city": "Bengaluru",
        "address": "Malleshwaram, Bengaluru",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_INOX_1],
    },
    {
        "_id": CINEMA_NEXUS,
        "name": "PVR: Nexus (Formerly Forum), Koramangala",
        "city": "Bengaluru",
        "address": "The Forum, Koramangala, Bengaluru",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_NEXUS_1, SCREEN_NEXUS_2],
    },
    {
        "_id": CINEMA_CINEPOLIS,
        "name": "Cinepolis: Nexus Shantiniketan",
        "city": "Bengaluru",
        "address": "Whitefield, Bengaluru",
        "amenities": ["M-Ticket"],
        "screens": [SCREEN_CINEPOLIS_1],
    },
    {
        "_id": CINEMA_ORION,
        "name": "PVR: Orion Mall, Rajajinagar",
        "city": "Bengaluru",
        "address": "Dr Rajkumar Road, Rajajinagar, Bengaluru",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_ORION_1],
    },
]

SCREENS = [
    {
        "_id": SCREEN_PVR_1,
        "cinema_id": CINEMA_PVR,
        "name": "AUDI 3",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_PVR_2,
        "cinema_id": CINEMA_PVR,
        "name": "AUDI 5",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_INOX_1,
        "cinema_id": CINEMA_INOX,
        "name": "Screen 1",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_NEXUS_1,
        "cinema_id": CINEMA_NEXUS,
        "name": "AUDI 6",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_NEXUS_2,
        "cinema_id": CINEMA_NEXUS,
        "name": "AUDI 2",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_CINEPOLIS_1,
        "cinema_id": CINEMA_CINEPOLIS,
        "name": "Screen 4",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_ORION_1,
        "cinema_id": CINEMA_ORION,
        "name": "AUDI 1",
        "seat_layout": _compact_layout(),
    },
]


def _build_shows():
    durations = {movie["_id"]: movie["duration_mins"] for movie in MOVIES}
    slots = [
        (MOVIE_VISHWANATH, [CINEMA_NEXUS, CINEMA_PVR, CINEMA_INOX, CINEMA_CINEPOLIS], ["10:15", "13:45", "18:00", "21:30"]),
        (MOVIE_AWARAPAN, [CINEMA_NEXUS, CINEMA_PVR, CINEMA_INOX, CINEMA_ORION], ["13:00", "16:15", "19:15", "22:15"]),
        (MOVIE_STREE, [CINEMA_PVR, CINEMA_INOX, CINEMA_CINEPOLIS], ["09:15", "12:15", "16:00", "21:00"]),
        (MOVIE_JAWAN, [CINEMA_PVR, CINEMA_NEXUS], ["10:00", "13:30", "19:30"]),
        (MOVIE_TWELFTH_FAIL, [CINEMA_INOX, CINEMA_ORION], ["11:00", "15:00", "18:00"]),
        (MOVIE_SPIDER, [CINEMA_CINEPOLIS, CINEMA_PVR], ["10:30", "14:00", "17:45", "21:15"]),
        (MOVIE_KALKI, [CINEMA_NEXUS, CINEMA_ORION], ["11:30", "16:00", "20:30"]),
        (MOVIE_ANIMAL, [CINEMA_PVR, CINEMA_CINEPOLIS], ["12:00", "16:30", "20:45"]),
        (MOVIE_DUNE, [CINEMA_NEXUS, CINEMA_CINEPOLIS], ["10:15", "14:30", "18:45"]),
        (MOVIE_OPPENHEIMER, [CINEMA_ORION, CINEMA_INOX], ["11:15", "15:30", "19:45"]),
        (MOVIE_PUSHPA, [CINEMA_NEXUS, CINEMA_PVR, CINEMA_ORION], ["10:00", "14:15", "18:30", "22:00"]),
        (MOVIE_FIGHTER, [CINEMA_INOX, CINEMA_CINEPOLIS], ["09:45", "13:15", "17:00", "21:30"]),
        (MOVIE_INTERSTELLAR, [CINEMA_PVR, CINEMA_NEXUS], ["11:00", "16:00", "19:30"]),
    ]

    shows = []
    n = 1
    used = set()
    today = date.today()
    for day_offset in range(7):
        show_date = today + timedelta(days=day_offset)
        times_limit = 4 if day_offset < 3 else 2
        for movie_id, cinema_ids, times in slots:
            for cinema_id in cinema_ids:
                screens = CINEMA_SCREENS[cinema_id]
                for index, start in enumerate(times[:times_limit]):
                    screen_id = None
                    for offset in range(len(screens)):
                        candidate = screens[(index + offset) % len(screens)]
                        key = (candidate, show_date.isoformat(), start)
                        if key not in used:
                            screen_id = candidate
                            used.add(key)
                            break
                    if screen_id is None:
                        continue
                    shows.append(
                        _show(
                            _show_oid(n),
                            movie_id,
                            cinema_id,
                            screen_id,
                            show_date,
                            start,
                            durations[movie_id],
                        )
                    )
                    n += 1
    return shows


async def _upsert_many(db, collection, docs):
    for doc in docs:
        payload = dict(doc)
        doc_id = payload.pop("_id")
        if collection == "shows":
            payload.pop("booked_seats", None)
            existing = await db[collection].find_one(
                {
                    "screen_id": payload["screen_id"],
                    "date": payload["date"],
                    "start_time": payload["start_time"],
                }
            )
            if existing is not None and existing["_id"] != doc_id:
                continue
            await db[collection].update_one(
                {"_id": doc_id},
                {"$set": payload, "$setOnInsert": {"booked_seats": []}},
                upsert=True,
            )
        else:
            await db[collection].update_one(
                {"_id": doc_id},
                {"$set": payload},
                upsert=True,
            )


async def seed_if_empty(db: AsyncIOMotorDatabase) -> None:
    await _upsert_many(db, "movies", MOVIES)
    await _upsert_many(db, "cinemas", CINEMAS)
    await _upsert_many(db, "screens", SCREENS)
    await _upsert_many(db, "shows", _build_shows())
    await db.shows.update_many({}, {"$set": {"price_tiers": dict(DEFAULT_PRICES)}})
