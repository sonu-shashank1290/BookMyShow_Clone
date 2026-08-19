import { api } from "@/common/lib/api";
import type { Movie, MovieList } from "@/features/movies/types";

export function listMovies(options: { city?: string; premiere?: boolean } = {}) {
  const query = new URLSearchParams({ page_size: "20" });
  if (options.city) query.set("city", options.city);
  if (options.premiere !== undefined) query.set("premiere", String(options.premiere));
  return api<MovieList>(`/movies?${query.toString()}`);
}

export function getMovie(movieId: string, city?: string) {
  const query = new URLSearchParams();
  if (city) query.set("city", city);
  const suffix = query.toString();
  return api<Movie>(`/movies/${movieId}${suffix ? `?${suffix}` : ""}`);
}
