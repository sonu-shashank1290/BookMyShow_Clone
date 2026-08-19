import { api } from "@/common/lib/api";
import type { Booking, BookingList, Payment } from "@/features/booking/types";

export function createBooking(showId: string, seats: string[], token: string) {
  return api<Booking>("/bookings", {
    method: "POST",
    token,
    body: JSON.stringify({ show_id: showId, seats }),
  });
}

export function listMyBookings(token: string) {
  return api<BookingList>("/bookings/me", { token });
}

export function getBooking(bookingId: string, token: string) {
  return api<Booking>(`/bookings/${bookingId}`, { token });
}

export function cancelPendingBooking(bookingId: string, token: string) {
  return api<{ deleted: boolean; show_id: string }>(`/bookings/${bookingId}`, {
    method: "DELETE",
    token,
  });
}

export function payBooking(bookingId: string, success: boolean, token: string) {
  return api<Payment>(`/payments/${bookingId}`, {
    method: "POST",
    token,
    body: JSON.stringify({ success }),
  });
}
