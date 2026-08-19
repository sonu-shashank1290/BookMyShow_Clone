import { api } from "@/common/lib/api";
import type { Movie, MovieList } from "@/features/movies/types";

export function listMovies() {
  return api<MovieList>("/movies?page_size=20");
}

export function getMovie(movieId: string, city = "Bengaluru") {
  const query = new URLSearchParams({ city });
  return api<Movie>(`/movies/${movieId}?${query.toString()}`);
}
