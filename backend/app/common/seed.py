import hashlib
from datetime import date, datetime, timedelta

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import UpdateOne

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
CINEMA_AMB = ObjectId("64b000000000000000000006")
CINEMA_ICON_HYD = ObjectId("64b000000000000000000007")
CINEMA_GVK = ObjectId("64b000000000000000000008")
CINEMA_INFINITI = ObjectId("64b000000000000000000009")
CINEMA_NARIMAN = ObjectId("64b00000000000000000000a")
CINEMA_CINEPOLIS_MUM = ObjectId("64b00000000000000000000b")
CINEMA_SAKET = ObjectId("64b00000000000000000000c")
CINEMA_NEHRU = ObjectId("64b00000000000000000000d")
CINEMA_PRIYA = ObjectId("64b00000000000000000000e")

SCREEN_PVR_1 = ObjectId("64c000000000000000000001")
SCREEN_PVR_2 = ObjectId("64c000000000000000000002")
SCREEN_INOX_1 = ObjectId("64c000000000000000000003")
SCREEN_NEXUS_1 = ObjectId("64c000000000000000000004")
SCREEN_NEXUS_2 = ObjectId("64c000000000000000000005")
SCREEN_CINEPOLIS_1 = ObjectId("64c000000000000000000006")
SCREEN_ORION_1 = ObjectId("64c000000000000000000007")
SCREEN_AMB_1 = ObjectId("64c000000000000000000008")
SCREEN_AMB_2 = ObjectId("64c000000000000000000009")
SCREEN_ICON_HYD_1 = ObjectId("64c00000000000000000000a")
SCREEN_ICON_HYD_2 = ObjectId("64c00000000000000000000b")
SCREEN_GVK_1 = ObjectId("64c00000000000000000000c")
SCREEN_GVK_2 = ObjectId("64c00000000000000000000d")
SCREEN_INFINITI_1 = ObjectId("64c00000000000000000000e")
SCREEN_INFINITI_2 = ObjectId("64c00000000000000000000f")
SCREEN_NARIMAN_1 = ObjectId("64c000000000000000000010")
SCREEN_NARIMAN_2 = ObjectId("64c000000000000000000011")
SCREEN_CINEPOLIS_MUM_1 = ObjectId("64c000000000000000000012")
SCREEN_CINEPOLIS_MUM_2 = ObjectId("64c000000000000000000013")
SCREEN_SAKET_1 = ObjectId("64c000000000000000000014")
SCREEN_SAKET_2 = ObjectId("64c000000000000000000015")
SCREEN_NEHRU_1 = ObjectId("64c000000000000000000016")
SCREEN_NEHRU_2 = ObjectId("64c000000000000000000017")
SCREEN_PRIYA_1 = ObjectId("64c000000000000000000018")
SCREEN_PRIYA_2 = ObjectId("64c000000000000000000019")

IMG = "https://image.tmdb.org/t/p"
DEFAULT_PRICES = {
    "classic_plus": 170,
    "classic": 210,
    "prime": 280,
    "recliner": 450,
}

CINEMA_SCREENS = {
    CINEMA_PVR: [SCREEN_PVR_1, SCREEN_PVR_2],
    CINEMA_INOX: [SCREEN_INOX_1],
    CINEMA_NEXUS: [SCREEN_NEXUS_1, SCREEN_NEXUS_2],
    CINEMA_CINEPOLIS: [SCREEN_CINEPOLIS_1],
    CINEMA_ORION: [SCREEN_ORION_1],
    CINEMA_AMB: [SCREEN_AMB_1, SCREEN_AMB_2],
    CINEMA_ICON_HYD: [SCREEN_ICON_HYD_1, SCREEN_ICON_HYD_2],
    CINEMA_GVK: [SCREEN_GVK_1, SCREEN_GVK_2],
    CINEMA_INFINITI: [SCREEN_INFINITI_1, SCREEN_INFINITI_2],
    CINEMA_NARIMAN: [SCREEN_NARIMAN_1, SCREEN_NARIMAN_2],
    CINEMA_CINEPOLIS_MUM: [SCREEN_CINEPOLIS_MUM_1, SCREEN_CINEPOLIS_MUM_2],
    CINEMA_SAKET: [SCREEN_SAKET_1, SCREEN_SAKET_2],
    CINEMA_NEHRU: [SCREEN_NEHRU_1, SCREEN_NEHRU_2],
    CINEMA_PRIYA: [SCREEN_PRIYA_1, SCREEN_PRIYA_2],
}


def _img(path, size="w500"):
    if path.startswith("http"):
        return path
    return "%s/%s%s" % (IMG, size, path)


def _poster(path):
    return _img(path, "w500")


def _backdrop(path):
    return _img(path, "w1280")


def _row(letter, tier, start, end=None):
    if end is None:
        end = start
        start = 1
    return {
        "row": letter,
        "tier": tier,
        "seats": ["%s%s" % (letter, i) for i in range(start, end + 1)],
    }


def _hall_layout():
    # Amphitheatre: missing edge seats so rows indent (BMS "half-cut" grid).
    # Seat numbers stay aligned in columns; aisle after 8.
    return {
        "rows": [
            _row("L", "recliner", 6, 15),
            _row("K", "prime", 3, 18),
            _row("J", "prime", 2, 19),
            _row("H", "prime", 1, 20),
            _row("G", "prime", 1, 20),
            _row("F", "prime", 1, 20),
            _row("E", "classic", 1, 20),
            _row("D", "classic", 1, 20),
            _row("C", "classic", 2, 19),
            _row("B", "classic_plus", 3, 18),
            _row("A", "classic_plus", 5, 16),
        ]
    }


def _compact_layout():
    return {
        "rows": [
            _row("F", "recliner", 5, 12),
            _row("E", "prime", 2, 15),
            _row("D", "prime", 1, 16),
            _row("C", "classic", 1, 16),
            _row("B", "classic", 2, 15),
            _row("A", "classic_plus", 4, 13),
        ]
    }


def _demo_booked(layout):
    """Leave realistic gaps so large ticket counts shrink to the pocket size."""
    booked = []
    for row in layout.get("rows") or []:
        seats = row.get("seats") or []
        tier = row.get("tier")
        count = len(seats)
        if tier == "classic" and count >= 8:
            booked.extend(seats[-4:])
        elif tier == "prime" and count >= 6:
            mid = count // 2
            booked.extend(seats[mid - 1 : mid + 1])
    return booked


def _end_time(start_time, duration_mins):
    parsed = datetime.strptime(start_time, "%H:%M")
    ended = parsed + timedelta(minutes=duration_mins)
    return ended.strftime("%H:%M")


def _show(
    movie_id,
    cinema_id,
    screen_id,
    city,
    show_date,
    start_time,
    duration_mins,
    language,
    fmt,
):
    return {
        "_id": _show_oid(screen_id, show_date, start_time),
        "movie_id": movie_id,
        "cinema_id": cinema_id,
        "screen_id": screen_id,
        "city": city,
        "date": show_date.isoformat(),
        "start_time": start_time,
        "end_time": _end_time(start_time, duration_mins),
        "language": language,
        "format": fmt,
        "price_tiers": dict(DEFAULT_PRICES),
        "booked_seats": [],
    }


def _show_oid(screen_id, show_date, start_time):
    """Derive the id from the natural key so re-seeding never duplicates a slot."""
    raw = "%s|%s|%s" % (screen_id, show_date.isoformat(), start_time)
    return ObjectId(hashlib.md5(raw.encode()).hexdigest()[:24])


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
    is_premiere=False,
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
        "is_premiere": is_premiere,
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
        is_premiere=True,
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
        is_premiere=True,
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
        is_premiere=True,
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
        is_premiere=True,
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
        is_premiere=True,
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
        is_premiere=True,
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
    {
        "_id": CINEMA_AMB,
        "name": "AMB Cinemas: Gachibowli",
        "city": "Hyderabad",
        "address": "Sattva Knowledge City, Gachibowli, Hyderabad",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_AMB_1, SCREEN_AMB_2],
    },
    {
        "_id": CINEMA_ICON_HYD,
        "name": "PVR ICON: Hitech City",
        "city": "Hyderabad",
        "address": "Inorbit Mall, Madhapur, Hyderabad",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_ICON_HYD_1, SCREEN_ICON_HYD_2],
    },
    {
        "_id": CINEMA_GVK,
        "name": "INOX: GVK One, Banjara Hills",
        "city": "Hyderabad",
        "address": "GVK One Mall, Banjara Hills, Hyderabad",
        "amenities": ["M-Ticket"],
        "screens": [SCREEN_GVK_1, SCREEN_GVK_2],
    },
    {
        "_id": CINEMA_INFINITI,
        "name": "PVR ICON: Infiniti Mall, Andheri West",
        "city": "Mumbai",
        "address": "Link Road, Andheri West, Mumbai",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_INFINITI_1, SCREEN_INFINITI_2],
    },
    {
        "_id": CINEMA_NARIMAN,
        "name": "INOX: Nariman Point",
        "city": "Mumbai",
        "address": "Vinay Bhavya Complex, Nariman Point, Mumbai",
        "amenities": ["M-Ticket"],
        "screens": [SCREEN_NARIMAN_1, SCREEN_NARIMAN_2],
    },
    {
        "_id": CINEMA_CINEPOLIS_MUM,
        "name": "Cinepolis: Viviana Mall, Thane",
        "city": "Mumbai",
        "address": "Eastern Express Highway, Thane West, Mumbai",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_CINEPOLIS_MUM_1, SCREEN_CINEPOLIS_MUM_2],
    },
    {
        "_id": CINEMA_SAKET,
        "name": "PVR: Select Citywalk, Saket",
        "city": "Delhi-NCR",
        "address": "Select Citywalk Mall, Saket, New Delhi",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_SAKET_1, SCREEN_SAKET_2],
    },
    {
        "_id": CINEMA_NEHRU,
        "name": "INOX: Nehru Place",
        "city": "Delhi-NCR",
        "address": "Epicuria Mall, Nehru Place, New Delhi",
        "amenities": ["M-Ticket"],
        "screens": [SCREEN_NEHRU_1, SCREEN_NEHRU_2],
    },
    {
        "_id": CINEMA_PRIYA,
        "name": "PVR: Priya, Vasant Vihar",
        "city": "Delhi-NCR",
        "address": "Basant Lok Complex, Vasant Vihar, New Delhi",
        "amenities": ["M-Ticket", "Food & Beverage"],
        "screens": [SCREEN_PRIYA_1, SCREEN_PRIYA_2],
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
    {
        "_id": SCREEN_AMB_1,
        "cinema_id": CINEMA_AMB,
        "name": "AUDI 1",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_AMB_2,
        "cinema_id": CINEMA_AMB,
        "name": "AUDI 4",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_ICON_HYD_1,
        "cinema_id": CINEMA_ICON_HYD,
        "name": "AUDI 2",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_ICON_HYD_2,
        "cinema_id": CINEMA_ICON_HYD,
        "name": "AUDI 5",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_GVK_1,
        "cinema_id": CINEMA_GVK,
        "name": "Screen 1",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_GVK_2,
        "cinema_id": CINEMA_GVK,
        "name": "Screen 3",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_INFINITI_1,
        "cinema_id": CINEMA_INFINITI,
        "name": "AUDI 1",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_INFINITI_2,
        "cinema_id": CINEMA_INFINITI,
        "name": "AUDI 3",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_NARIMAN_1,
        "cinema_id": CINEMA_NARIMAN,
        "name": "Screen 1",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_NARIMAN_2,
        "cinema_id": CINEMA_NARIMAN,
        "name": "Screen 2",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_CINEPOLIS_MUM_1,
        "cinema_id": CINEMA_CINEPOLIS_MUM,
        "name": "Screen 2",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_CINEPOLIS_MUM_2,
        "cinema_id": CINEMA_CINEPOLIS_MUM,
        "name": "Screen 6",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_SAKET_1,
        "cinema_id": CINEMA_SAKET,
        "name": "AUDI 2",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_SAKET_2,
        "cinema_id": CINEMA_SAKET,
        "name": "AUDI 4",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_NEHRU_1,
        "cinema_id": CINEMA_NEHRU,
        "name": "Screen 1",
        "seat_layout": _compact_layout(),
    },
    {
        "_id": SCREEN_NEHRU_2,
        "cinema_id": CINEMA_NEHRU,
        "name": "Screen 4",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_PRIYA_1,
        "cinema_id": CINEMA_PRIYA,
        "name": "AUDI 1",
        "seat_layout": _hall_layout(),
    },
    {
        "_id": SCREEN_PRIYA_2,
        "cinema_id": CINEMA_PRIYA,
        "name": "AUDI 3",
        "seat_layout": _compact_layout(),
    },
]


def _cinema_oid(name):
    return ObjectId(hashlib.md5(("cinema|" + name).encode()).hexdigest()[:24])


def _screen_oid(cinema_name, screen_name):
    raw = "screen|%s|%s" % (cinema_name, screen_name)
    return ObjectId(hashlib.md5(raw.encode()).hexdigest()[:24])


TIME_SLOTS = [
    ["10:15", "13:45", "18:00", "21:30"],
    ["09:30", "12:45", "16:30", "20:15"],
    ["11:00", "15:00", "19:00", "22:15"],
    ["10:45", "14:15", "17:45", "21:00"],
    ["12:15", "16:00", "19:45"],
    ["09:45", "13:15", "17:15", "20:45"],
]

# Cities beyond the four hand-written ones above. Ids are derived from the name
# so adding a city is a few lines of data instead of a batch of fresh ObjectIds.
EXTRA_CITIES = [
    {
        "city": "Chennai",
        "cinemas": [
            ("PVR: Sathyam, Royapettah", "Thiru Vi Ka Road, Royapettah, Chennai", ["AUDI 1", "AUDI 3"]),
            ("INOX: Phoenix Marketcity, Velachery", "Velachery Main Road, Chennai", ["Screen 2", "Screen 5"]),
        ],
        "movies": [MOVIE_VISHWANATH, MOVIE_KALKI, MOVIE_JAWAN, MOVIE_SPIDER, MOVIE_PUSHPA, MOVIE_DUNE],
    },
    {
        "city": "Kolkata",
        "cinemas": [
            ("INOX: South City Mall", "Prince Anwar Shah Road, Kolkata", ["Screen 1", "Screen 4"]),
            ("PVR: Mani Square", "Kankurgachi, Kolkata", ["AUDI 2", "AUDI 5"]),
        ],
        "movies": [MOVIE_VISHWANATH, MOVIE_STREE, MOVIE_ANIMAL, MOVIE_OPPENHEIMER, MOVIE_TWELFTH_FAIL, MOVIE_INTERSTELLAR],
    },
    {
        "city": "Pune",
        "cinemas": [
            ("PVR: Phoenix Marketcity, Viman Nagar", "Viman Nagar, Pune", ["AUDI 1", "AUDI 4"]),
            ("INOX: Bund Garden Road", "Bund Garden Road, Pune", ["Screen 2", "Screen 3"]),
        ],
        "movies": [MOVIE_VISHWANATH, MOVIE_STREE, MOVIE_FIGHTER, MOVIE_JAWAN, MOVIE_DUNE, MOVIE_ANIMAL],
    },
    {
        "city": "Ahmedabad",
        "cinemas": [
            ("PVR: Acropolis Mall, Thaltej", "Thaltej, Ahmedabad", ["AUDI 2", "AUDI 6"]),
            ("INOX: Ahmedabad One", "Vastrapur, Ahmedabad", ["Screen 1", "Screen 5"]),
        ],
        "movies": [MOVIE_VISHWANATH, MOVIE_STREE, MOVIE_ANIMAL, MOVIE_PUSHPA, MOVIE_FIGHTER, MOVIE_JAWAN],
    },
    {
        "city": "Chandigarh",
        "cinemas": [
            ("PVR: Elante Mall", "Industrial Area Phase 1, Chandigarh", ["AUDI 1", "AUDI 3"]),
            ("INOX: Piccadily Square", "Sector 34, Chandigarh", ["Screen 2", "Screen 4"]),
        ],
        "movies": [MOVIE_VISHWANATH, MOVIE_TWELFTH_FAIL, MOVIE_FIGHTER, MOVIE_ANIMAL, MOVIE_DUNE, MOVIE_OPPENHEIMER],
    },
    {
        "city": "Kochi",
        "cinemas": [
            ("PVR: Lulu Mall, Edappally", "Lulu Mall, Edappally, Kochi", ["AUDI 3", "AUDI 7"]),
            ("Cinepolis: Centre Square Mall", "MG Road, Kochi", ["Screen 1", "Screen 6"]),
        ],
        "movies": [MOVIE_VISHWANATH, MOVIE_KALKI, MOVIE_SPIDER, MOVIE_INTERSTELLAR, MOVIE_STREE, MOVIE_JAWAN],
    },
    {
        "city": "Coimbatore",
        "cinemas": [("INOX: Brookefields Mall", "Brookefields Mall, Coimbatore", ["Screen 1", "Screen 3"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_KALKI, MOVIE_JAWAN, MOVIE_SPIDER],
    },
    {
        "city": "Indore",
        "cinemas": [("PVR: Treasure Island Mall", "MG Road, Indore", ["AUDI 1", "AUDI 4"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_STREE, MOVIE_ANIMAL, MOVIE_FIGHTER],
    },
    {
        "city": "Jaipur",
        "cinemas": [("INOX: Crystal Palm Mall", "Ajmer Road, Jaipur", ["Screen 2", "Screen 5"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_JAWAN, MOVIE_ANIMAL, MOVIE_TWELFTH_FAIL],
    },
    {
        "city": "Lucknow",
        "cinemas": [("PVR: Phoenix Palassio", "Gomti Nagar, Lucknow", ["AUDI 2", "AUDI 6"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_STREE, MOVIE_FIGHTER, MOVIE_JAWAN],
    },
    {
        "city": "Mysuru",
        "cinemas": [("INOX: Mall of Mysore", "Indiranagar, Mysuru", ["Screen 1", "Screen 2"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_KALKI, MOVIE_STREE, MOVIE_DUNE],
    },
    {
        "city": "Nagpur",
        "cinemas": [("INOX: Empress City Mall", "Empress City, Nagpur", ["Screen 3", "Screen 4"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_ANIMAL, MOVIE_JAWAN, MOVIE_OPPENHEIMER],
    },
    {
        "city": "Vadodara",
        "cinemas": [("INOX: Race Course", "Race Course Circle, Vadodara", ["Screen 1", "Screen 5"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_STREE, MOVIE_PUSHPA, MOVIE_FIGHTER],
    },
    {
        "city": "Visakhapatnam",
        "cinemas": [("INOX: CMR Central", "Maddilapalem, Visakhapatnam", ["Screen 2", "Screen 4"])],
        "movies": [MOVIE_VISHWANATH, MOVIE_KALKI, MOVIE_PUSHPA, MOVIE_SPIDER],
    },
]


def _expand_extra_cities():
    cinemas, screens, screens_by_cinema, plan = [], [], {}, {}
    for entry in EXTRA_CITIES:
        city = entry["city"]
        cinema_ids = []
        for cinema_name, address, screen_names in entry["cinemas"]:
            cinema_id = _cinema_oid(cinema_name)
            cinema_ids.append(cinema_id)
            screen_ids = []
            for index, screen_name in enumerate(screen_names):
                screen_id = _screen_oid(cinema_name, screen_name)
                screen_ids.append(screen_id)
                screens.append(
                    {
                        "_id": screen_id,
                        "cinema_id": cinema_id,
                        "name": screen_name,
                        "seat_layout": _hall_layout() if index % 2 == 0 else _compact_layout(),
                    }
                )
            screens_by_cinema[cinema_id] = screen_ids
            cinemas.append(
                {
                    "_id": cinema_id,
                    "name": cinema_name,
                    "city": city,
                    "address": address,
                    "amenities": ["M-Ticket", "Food & Beverage"],
                    "screens": screen_ids,
                }
            )

        slots = []
        for index, movie_id in enumerate(entry["movies"]):
            venues = [cinema_ids[index % len(cinema_ids)]]
            if len(cinema_ids) > 1:
                venues.append(cinema_ids[(index + 1) % len(cinema_ids)])
            slots.append((movie_id, venues, TIME_SLOTS[index % len(TIME_SLOTS)]))
        plan[city] = slots

    return cinemas, screens, screens_by_cinema, plan


# Which movies play where, per city. A city with no plan simply has no shows.
CITY_SHOW_PLAN = {
    "Bengaluru": [
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
    ],
    "Hyderabad": [
        (MOVIE_VISHWANATH, [CINEMA_AMB, CINEMA_ICON_HYD, CINEMA_GVK], ["10:15", "14:00", "18:30", "21:45"]),
        (MOVIE_KALKI, [CINEMA_AMB, CINEMA_GVK], ["11:00", "15:30", "19:45"]),
        (MOVIE_PUSHPA, [CINEMA_AMB, CINEMA_ICON_HYD, CINEMA_GVK], ["09:45", "13:30", "17:15", "21:00"]),
        (MOVIE_STREE, [CINEMA_GVK, CINEMA_ICON_HYD], ["12:00", "16:00", "20:15"]),
        (MOVIE_DUNE, [CINEMA_AMB, CINEMA_ICON_HYD], ["10:30", "14:45", "19:00"]),
        (MOVIE_JAWAN, [CINEMA_ICON_HYD, CINEMA_GVK], ["11:30", "16:30", "20:45"]),
        (MOVIE_SPIDER, [CINEMA_AMB, CINEMA_GVK], ["12:45", "17:45", "22:15"]),
    ],
    "Mumbai": [
        (MOVIE_VISHWANATH, [CINEMA_INFINITI, CINEMA_CINEPOLIS_MUM], ["10:00", "13:45", "18:15", "21:30"]),
        (MOVIE_ANIMAL, [CINEMA_INFINITI, CINEMA_NARIMAN], ["12:15", "16:45", "20:30"]),
        (MOVIE_STREE, [CINEMA_INFINITI, CINEMA_NARIMAN, CINEMA_CINEPOLIS_MUM], ["09:30", "13:00", "17:30", "21:15"]),
        (MOVIE_OPPENHEIMER, [CINEMA_NARIMAN, CINEMA_INFINITI], ["11:15", "15:45", "20:00"]),
        (MOVIE_SPIDER, [CINEMA_CINEPOLIS_MUM, CINEMA_INFINITI], ["10:45", "14:30", "18:45"]),
        (MOVIE_FIGHTER, [CINEMA_NARIMAN, CINEMA_CINEPOLIS_MUM], ["12:30", "17:00", "21:45"]),
        (MOVIE_JAWAN, [CINEMA_CINEPOLIS_MUM, CINEMA_NARIMAN], ["11:45", "15:15", "19:15"]),
    ],
    "Delhi-NCR": [
        (MOVIE_VISHWANATH, [CINEMA_SAKET, CINEMA_PRIYA], ["10:30", "14:15", "18:00", "22:00"]),
        (MOVIE_TWELFTH_FAIL, [CINEMA_SAKET, CINEMA_NEHRU], ["11:00", "15:00", "19:30"]),
        (MOVIE_ANIMAL, [CINEMA_SAKET, CINEMA_PRIYA], ["12:45", "17:15", "21:00"]),
        (MOVIE_INTERSTELLAR, [CINEMA_NEHRU, CINEMA_SAKET], ["10:00", "15:15", "20:15"]),
        (MOVIE_JAWAN, [CINEMA_PRIYA, CINEMA_NEHRU], ["11:45", "16:15", "20:45"]),
        (MOVIE_DUNE, [CINEMA_SAKET, CINEMA_NEHRU], ["13:15", "18:30", "22:15"]),
        (MOVIE_FIGHTER, [CINEMA_PRIYA, CINEMA_NEHRU], ["09:45", "14:45", "19:00"]),
    ],
}


_EXTRA_CINEMAS, _EXTRA_SCREENS, _EXTRA_SCREENS_BY_CINEMA, _EXTRA_PLAN = _expand_extra_cities()
CINEMAS.extend(_EXTRA_CINEMAS)
SCREENS.extend(_EXTRA_SCREENS)
CINEMA_SCREENS.update(_EXTRA_SCREENS_BY_CINEMA)
CITY_SHOW_PLAN.update(_EXTRA_PLAN)


def _language_format_combos(movie):
    combos = []
    for language, formats in (movie.get("language_formats") or {}).items():
        for fmt in formats or ["2D"]:
            combos.append((language, fmt))
    if not combos:
        combos.append((movie["language"][0], "2D"))
    return combos


def _build_shows():
    movies = {movie["_id"]: movie for movie in MOVIES}
    shows = []
    used = set()
    today = date.today()
    for day_offset in range(7):
        show_date = today + timedelta(days=day_offset)
        times_limit = 4 if day_offset < 3 else 2
        for city, plan in CITY_SHOW_PLAN.items():
            for movie_id, cinema_ids, times in plan:
                movie = movies[movie_id]
                combos = _language_format_combos(movie)
                for cinema_index, cinema_id in enumerate(cinema_ids):
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
                        # Spread a movie's languages/formats across its slots so
                        # filtering by "Telugu 2D" narrows the list instead of
                        # returning everything or nothing.
                        language, fmt = combos[(cinema_index + index) % len(combos)]
                        shows.append(
                            _show(
                                movie_id,
                                cinema_id,
                                screen_id,
                                city,
                                show_date,
                                start,
                                movie["duration_mins"],
                                language,
                                fmt,
                            )
                        )
    return shows


async def _upsert_many(db, collection, docs):
    operations = [
        UpdateOne(
            {"_id": doc["_id"]},
            {"$set": {key: value for key, value in doc.items() if key != "_id"}},
            upsert=True,
        )
        for doc in docs
    ]
    if operations:
        await db[collection].bulk_write(operations, ordered=False)


async def _backfill_shows(db):
    """Earlier seeds wrote shows with no city/language/format.

    Those rows can be pinned in place by an existing booking, so fill the new
    fields in rather than letting them drop out of every filtered listing.
    """
    stale = [doc async for doc in db.shows.find({"city": {"$exists": False}})]
    if not stale:
        return

    cities = {doc["_id"]: doc.get("city") async for doc in db.cinemas.find({}, {"city": 1})}
    defaults = {
        movie["_id"]: _language_format_combos(movie)[0] for movie in MOVIES
    }

    operations = []
    for doc in stale:
        language, fmt = defaults.get(doc["movie_id"], ("Hindi", "2D"))
        operations.append(
            UpdateOne(
                {"_id": doc["_id"]},
                {
                    "$set": {
                        "city": cities.get(doc["cinema_id"]) or "Bengaluru",
                        "language": doc.get("language") or language,
                        "format": doc.get("format") or fmt,
                    }
                },
            )
        )
    await db.shows.bulk_write(operations, ordered=False)


async def _upsert_shows(db, docs):
    wanted = [doc["_id"] for doc in docs]
    dates = sorted({doc["date"] for doc in docs})

    # Show ids are derived from (screen, date, time), so anything left over in
    # the seeded window is stale. Drop it unless somebody has booked into it.
    await db.shows.delete_many(
        {"date": {"$in": dates}, "_id": {"$nin": wanted}, "booked_seats": {"$size": 0}}
    )

    taken = {
        (doc["screen_id"], doc["date"], doc["start_time"]): doc["_id"]
        async for doc in db.shows.find(
            {"date": {"$in": dates}},
            {"screen_id": 1, "date": 1, "start_time": 1},
        )
    }

    operations = []
    for doc in docs:
        payload = {
            key: value
            for key, value in doc.items()
            if key not in ("_id", "booked_seats")
        }
        owner = taken.get((doc["screen_id"], doc["date"], doc["start_time"]))
        if owner is not None and owner != doc["_id"]:
            continue
        operations.append(
            UpdateOne(
                {"_id": doc["_id"]},
                {"$set": payload, "$setOnInsert": {"booked_seats": []}},
                upsert=True,
            )
        )
    if operations:
        await db.shows.bulk_write(operations, ordered=False)


async def _seed_demo_occupancy(db: AsyncIOMotorDatabase) -> None:
    screens = {doc["_id"]: doc async for doc in db.screens.find({}, {"seat_layout": 1})}
    operations = []
    async for show in db.shows.find({"booked_seats": {"$size": 0}}, {"screen_id": 1}):
        screen = screens.get(show["screen_id"])
        if screen is None:
            continue
        booked = _demo_booked(screen.get("seat_layout") or {})
        if not booked:
            continue
        operations.append(
            UpdateOne(
                {"_id": show["_id"], "booked_seats": {"$size": 0}},
                {"$set": {"booked_seats": booked}},
            )
        )
    if operations:
        await db.shows.bulk_write(operations, ordered=False)


async def seed_if_empty(db: AsyncIOMotorDatabase) -> None:
    await _upsert_many(db, "movies", MOVIES)
    await _upsert_many(db, "cinemas", CINEMAS)
    await _upsert_many(db, "screens", SCREENS)
    await _backfill_shows(db)
    await _upsert_shows(db, _build_shows())
    await db.shows.update_many({}, {"$set": {"price_tiers": dict(DEFAULT_PRICES)}})
    await _seed_demo_occupancy(db)
