export type Showtime = {
  show_id: string;
  start_time: string;
  end_time: string;
  price_tiers: Record<string, number>;
};

export type ScreenShowtimes = {
  screen_id: string;
  screen_name: string;
  showtimes: Showtime[];
};

export type CinemaShowtimes = {
  cinema_id: string;
  cinema_name: string;
  city: string;
  address?: string;
  amenities?: string[];
  screens: ScreenShowtimes[];
};

export type ShowList = {
  movie_id: string;
  date: string;
  cinemas: CinemaShowtimes[];
};

export type Show = {
  id: string;
  movie_id: string;
  cinema_id: string;
  screen_id: string;
  date: string;
  start_time: string;
  end_time: string;
  price_tiers: Record<string, number>;
  booked_seats: string[];
  movie_title?: string | null;
  movie_rating?: string | null;
  languages?: string[] | null;
  formats?: string[] | null;
  cinema_name?: string | null;
  cinema_address?: string | null;
  screen_name?: string | null;
};
