import { api } from "@/common/lib/api";
import type { SeatMap } from "@/features/seats/types";

export function getSeatMap(showId: string, token?: string | null) {
  return api<SeatMap>(`/shows/${showId}/seats`, { token });
}

export function lockSeat(showId: string, seatId: string, token: string) {
  return api("/seats/lock", {
    method: "POST",
    token,
    body: JSON.stringify({ show_id: showId, seat_id: seatId }),
  });
}

export function unlockSeat(showId: string, seatId: string, token: string) {
  const query = new URLSearchParams({ show_id: showId, seat_id: seatId });
  return api(`/seats/lock?${query.toString()}`, { method: "DELETE", token });
}
