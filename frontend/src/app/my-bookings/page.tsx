"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import { listMyBookings } from "@/features/booking/api/booking";
import { MTicket } from "@/features/booking/components/MTicket";
import type { Booking } from "@/features/booking/types";
import { useAuth } from "@/features/auth/store/auth-context";

export default function MyBookingsPage() {
  const { token, ready, user } = useAuth();
  const [items, setItems] = useState<Booking[]>([]);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !token) return;
    listMyBookings(token)
      .then((data) => {
        setItems(data.items);
        const firstTicket = data.items.find((item) => item.status === "confirmed");
        if (firstTicket) setOpenId(firstTicket.id);
      })
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

  const tickets = items.filter((item) => item.status === "confirmed");
  const others = items.filter((item) => item.status !== "confirmed");

  return (
    <main className="mx-auto w-full max-w-[1240px] px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900">My bookings</h1>
      <p className="mb-6 text-sm text-zinc-500">Confirmed bookings appear as M-Tickets with a QR code.</p>
      {error ? <p className="text-red-500">{error}</p> : null}

      {items.length === 0 ? (
        <p className="text-zinc-500">No bookings yet. Book a show to generate an M-Ticket.</p>
      ) : null}

      {tickets.length ? (
        <section className="space-y-6">
          {tickets.map((booking) => {
            const open = openId === booking.id;
            return (
              <div key={booking.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : booking.id)}
                  className="mb-3 flex w-full items-center justify-between text-left"
                >
                  <span className="text-[15px] font-semibold text-[#333]">
                    {booking.movie_title ?? "Movie"}
                    <span className="ml-2 font-mono text-[12px] font-normal text-[#888]">
                      {booking.ticket_code}
                    </span>
                  </span>
                  <span className="text-[13px] text-[#f84464]">{open ? "Hide ticket" : "Show M-Ticket"}</span>
                </button>
                {open ? (
                  <div className="mx-auto max-w-md">
                    <MTicket booking={booking} holder={user.name} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-500">
          No M-Tickets yet. Finish payment on a booking and the ticket with QR will show up here.
        </p>
      )}

      {others.length ? (
        <section className="mt-10">
          <h2 className="mb-3 text-[15px] font-semibold text-[#666]">Other bookings</h2>
          <ul className="space-y-3">
            {others.map((booking) => (
              <li key={booking.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-900">{booking.movie_title ?? "Movie"}</p>
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
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
