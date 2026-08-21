import { api } from "@/common/lib/api";
import type { SeatMap } from "@/features/seats/types";

export function getSeatMap(showId: string, token?: string | null) {
  return api<SeatMap>(`/shows/${showId}/seats`, { token });
}

export function lockSeats(showId: string, seatIds: string[], token: string) {
  return api("/seats/lock", {
    method: "POST",
    token,
    body: JSON.stringify({ show_id: showId, seat_ids: seatIds }),
  });
}

export function unlockSeats(showId: string, seatIds: string[], token: string) {
  const query = new URLSearchParams({ show_id: showId });
  for (const id of seatIds) {
    query.append("seat_ids", id);
  }
  return api(`/seats/lock?${query.toString()}`, { method: "DELETE", token });
}
