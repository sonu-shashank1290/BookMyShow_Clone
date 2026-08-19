"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import { listMyBookings } from "@/features/booking/api/booking";
import type { Booking } from "@/features/booking/types";
import { useAuth } from "@/features/auth/store/auth-context";

export default function MyBookingsPage() {
  const { token, ready, user } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    listMyBookings(token)
      .then((data) => setItems(data.items))
      .catch(() => setError("Could not load bookings"));
  }, [ready, token]);

  if (!ready) {
    return <main className="mx-auto max-w-[1240px] px-6 py-10 text-zinc-500">Loading…</main>;
  }
  if (!user) {
    return (
      <main className="mx-auto max-w-[1240px] px-6 py-10">
        <p className="text-zinc-600">
          <Link href="/login" className="text-[#f84464]">
            Sign in
          </Link>{" "}
          to see your bookings.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">My bookings</h1>
      {error ? <p className="text-red-500">{error}</p> : null}
      {items.length === 0 ? (
        <p className="text-zinc-500">No bookings yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((booking) => (
            <li
              key={booking.id}
              className="rounded-lg border border-zinc-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-900">
                    {booking.movie_title ?? "Movie"}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{booking.cinema_name}</p>
                  <p className="text-sm text-zinc-500">
                    {booking.show_date ? formatShowDate(booking.show_date, "short") : ""}
                    {booking.start_time ? ` | ${formatTime12(booking.start_time)}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">{booking.seats.join(", ")}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs capitalize text-zinc-500">{booking.status}</span>
                  <p className="mt-1 text-sm font-semibold">₹{rupees(booking.amount)}</p>
                  {booking.status === "confirmed" ? (
                    <Link
                      href={`/payment/${booking.id}/confirmed`}
                      className="mt-2 inline-block text-xs text-[#f84464]"
                    >
                      View ticket
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
