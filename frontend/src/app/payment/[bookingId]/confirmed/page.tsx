"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import { getBooking } from "@/features/booking/api/booking";
import type { Booking } from "@/features/booking/types";
import { useAuth } from "@/features/auth/store/auth-context";

export default function BookingConfirmedPage() {
  const params = useParams<{ bookingId: string }>();
  const { token, ready } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    getBooking(params.bookingId, token).then(setBooking).catch(() => undefined);
  }, [ready, token, params.bookingId]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-4 py-10">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 text-center shadow-sm">
        <p className="text-4xl">🎟️</p>
        <h1 className="mt-3 text-2xl font-bold text-emerald-600">Booking confirmed</h1>
        <p className="mt-1 text-sm text-zinc-500">Your M-Ticket is ready</p>
        {booking ? (
          <div className="mt-6 space-y-1 text-left text-sm text-zinc-700">
            <p className="text-lg font-semibold text-zinc-900">{booking.movie_title}</p>
            <p>{booking.cinema_name}</p>
            <p>
              {booking.show_date ? formatShowDate(booking.show_date, "short") : ""}
              {booking.start_time ? ` | ${formatTime12(booking.start_time)}` : ""}
            </p>
            <p>Seats: {booking.seats.join(", ")}</p>
            <p className="font-semibold">Amount: ₹{rupees(booking.amount)}</p>
            <p className="text-xs uppercase text-zinc-400">Status: {booking.status}</p>
          </div>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">Loading ticket…</p>
        )}
        <Link
          href="/my-bookings"
          className="mt-6 inline-block w-full rounded-md bg-[#f84464] py-2.5 text-sm font-semibold text-white"
        >
          View my bookings
        </Link>
      </div>
    </main>
  );
}
