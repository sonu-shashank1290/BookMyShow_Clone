"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { getBooking } from "@/features/booking/api/booking";
import { MTicket } from "@/features/booking/components/MTicket";
import type { Booking } from "@/features/booking/types";
import { useAuth } from "@/features/auth/store/auth-context";

export default function BookingConfirmedPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { token, ready, user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace(`/login?next=/payment/${params.bookingId}/confirmed`);
      return;
    }
    getBooking(params.bookingId, token)
      .then(setBooking)
      .catch(() => setError("Could not load ticket"));
  }, [ready, token, params.bookingId, router]);

  return (
    <main className="min-h-screen bg-[#1f2533] px-4 py-10">
      <div className="mx-auto max-w-md">
        <p className="mb-4 text-center text-[13px] font-medium text-white">Your M-Ticket</p>
        {error ? (
          <p className="text-center text-sm text-red-300">{error}</p>
        ) : !booking ? (
          <p className="text-center text-sm text-zinc-400">Loading ticket…</p>
        ) : booking.status !== "confirmed" ? (
          <p className="text-center text-sm text-zinc-400">
            This booking is {booking.status}. An M-Ticket is issued only after payment.
          </p>
        ) : (
          <MTicket booking={booking} holder={user?.name} />
        )}
        <Link
          href="/my-bookings"
          className="mt-6 block w-full rounded-md bg-[#f84464] py-2.5 text-center text-sm font-semibold text-white hover:bg-[#e03858]"
        >
          View my bookings
        </Link>
        <Link href="/" className="mt-3 block text-center text-[13px] text-zinc-400 hover:text-white">
          Back to home
        </Link>
      </div>
    </main>
  );
}
