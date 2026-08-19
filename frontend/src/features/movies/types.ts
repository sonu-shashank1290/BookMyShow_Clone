export type MovieCinema = {
  id: string;
  name: string;
  city: string;
  address: string;
};

export type MoviePerson = {
  name: string;
  role: string;
  photo_url: string;
};

export type Movie = {
  id: string;
  title: string;
  language: string[];
  genre: string[];
  duration_mins: number;
  rating: string;
  poster_url: string;
  backdrop_url?: string | null;
  description: string;
  release_date?: string | null;
  vote_average?: number;
  vote_count?: number;
  formats?: string[];
  language_formats?: Record<string, string[]>;
  cast?: MoviePerson[];
  crew?: MoviePerson[];
  is_active: boolean;
  cinemas?: MovieCinema[] | null;
};

export type MovieList = {
  items: Movie[];
  page: number;
  page_size: number;
  total: number;
};
