import { api } from "@/common/lib/api";
import type { Show, ShowList } from "@/features/shows/types";

export type ShowFilters = {
  city?: string;
  language?: string;
  format?: string;
};

export function listShows(movieId: string, date: string, filters: ShowFilters = {}) {
  const query = new URLSearchParams({ movie_id: movieId, date });
  if (filters.city) query.set("city", filters.city);
  if (filters.language) query.set("language", filters.language);
  if (filters.format) query.set("format", filters.format);
  return api<ShowList>(`/shows?${query.toString()}`);
}

export function getShow(showId: string) {
  return api<Show>(`/shows/${showId}`);
}
