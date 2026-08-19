import { api } from "@/common/lib/api";
import type { Show, ShowList } from "@/features/shows/types";

export function listShows(movieId: string, date: string) {
  const query = new URLSearchParams({ movie_id: movieId, date });
  return api<ShowList>(`/shows?${query.toString()}`);
}

export function getShow(showId: string) {
  return api<Show>(`/shows/${showId}`);
}
