"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { BackIcon } from "@/common/components/Icons";
import { ApiError } from "@/common/lib/api";
import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import { cancelPendingBooking, getBooking, payBooking } from "@/features/booking/api/booking";
import type { Booking } from "@/features/booking/types";
import { useAuth } from "@/features/auth/store/auth-context";

const METHODS = [
  "Pay by any UPI App",
  "Debit/Credit Card",
  "Mobile Wallets",
  "Gift Voucher",
  "Net Banking",
  "Pay Later",
];

export default function PaymentPage() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { token, ready, user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [method, setMethod] = useState(METHODS[0]);

  useEffect(() => {
    if (!ready || !token) return;
    getBooking(params.bookingId, token)
      .then(setBooking)
      .catch(() => setError("Could not load booking"));
  }, [ready, token, params.bookingId]);

  const fees = useMemo(() => {
    const tickets = booking?.amount ?? 0;
    const convenience = Number((tickets * 0.172).toFixed(2));
    return { tickets, convenience, total: Number((tickets + convenience).toFixed(2)) };
  }, [booking]);

  function seatsPath(showId: string) {
    const qty = booking?.seats.length;
    return qty ? `/booking/${showId}/seats?qty=${qty}` : `/booking/${showId}/seats`;
  }

  async function goBackToSeats() {
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      const result = await cancelPendingBooking(params.bookingId, token);
      router.push(seatsPath(result.show_id));
    } catch {
      if (booking?.show_id) {
        router.push(seatsPath(booking.show_id));
        return;
      }
      router.push("/");
    }
  }

  async function pay(success: boolean) {
    if (!token) {
      router.push("/login");
      return;
    }
    setPending(true);
    setError("");
    try {
      await payBooking(params.bookingId, success, token);
      if (success) {
        router.push(`/payment/${params.bookingId}/confirmed`);
      } else {
        setError("Payment failed. Seats were released.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Payment failed");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return <main className="px-6 py-10 text-zinc-500">Loading…</main>;
  }

  return (
    <main className="min-h-screen bg-[#f2f2f2]">
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button
            type="button"
            onClick={goBackToSeats}
            className="text-zinc-600"
            aria-label="Back to seat selection"
          >
            <BackIcon />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-zinc-900">
              {booking?.movie_title ?? "Checkout"}
              {booking?.movie_rating ? ` (${booking.movie_rating})` : ""}
            </h1>
            <p className="text-xs text-zinc-500">
              {booking?.cinema_name}
              {booking?.screen_name ? ` (${booking.screen_name})` : ""}
              {booking?.show_date ? ` | ${formatShowDate(booking.show_date, "short")}` : ""}
              {booking?.start_time ? ` | ${formatTime12(booking.start_time)}` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <h2 className="px-5 py-4 text-lg font-bold text-zinc-900">Payment options</h2>
          <div className="flex min-h-[320px] border-t border-zinc-100">
            <aside className="w-48 shrink-0 border-r border-zinc-100">
              {METHODS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMethod(item)}
                  className={`block w-full border-l-4 px-3 py-3 text-left text-sm ${
                    method === item
                      ? "border-[#f84464] bg-[#fff0f3] font-medium text-zinc-900"
                      : "border-transparent text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </aside>
            <div className="flex-1 p-5">
              <h3 className="font-semibold text-zinc-900">{method}</h3>
              <div className="mt-4 flex items-center justify-between rounded-md border border-zinc-200 px-4 py-3">
                <div>
                  <p className="text-sm text-zinc-800">Scan QR code</p>
                  <p className="text-xs text-zinc-500">You need to have a registered UPI ID</p>
                </div>
                <span className="text-zinc-400">›</span>
              </div>
              {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  disabled={pending || !booking}
                  onClick={() => pay(true)}
                  className="flex-1 rounded-md bg-[#f84464] py-2.5 text-sm font-semibold text-white hover:bg-[#e03858] disabled:opacity-50"
                >
                  {pending ? "Paying…" : `Pay ₹${rupees(fees.total)}`}
                </button>
                <button
                  type="button"
                  disabled={pending || !booking}
                  onClick={() => pay(false)}
                  className="rounded-md border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                >
                  Fail
                </button>
              </div>
              <p className="mt-3 text-[11px] text-zinc-500">
                Mock payment: success confirms seats, fail releases them.
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">
                  {booking?.movie_title ?? "Movie"}
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {booking?.show_date ? formatShowDate(booking.show_date, "short") : ""}
                  {booking?.start_time ? ` | ${formatTime12(booking.start_time)}` : ""}
                </p>
                <p className="text-xs text-zinc-500">
                  {(booking?.languages?.[0] ?? "Hindi")} (2D)
                </p>
                <p className="text-xs text-zinc-500">{booking?.seats.join(", ")}</p>
                <p className="text-xs text-zinc-500">{booking?.cinema_address}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{booking?.seats.length ?? 0}</p>
                <p className="text-xs font-medium text-[#f84464]">M-Ticket</p>
              </div>
            </div>
            <div className="mt-4 rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              Cancellation Available. This venue supports booking cancellation.
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Ticket(s) price</span>
                <span>₹{rupees(fees.tickets)}.00</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Convenience fees</span>
                <span>₹{rupees(fees.convenience)}</span>
              </div>
              <div className="border-t border-dashed border-zinc-200 pt-2 font-semibold">
                <div className="flex justify-between">
                  <span>Order total</span>
                  <span>₹{rupees(fees.total)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-600">
              <p className="mb-1 font-semibold text-zinc-800">For Sending Booking Details</p>
              <p>{user?.email ?? "Sign in to continue"}</p>
            </div>
          </section>
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-5 py-4">
            <span className="text-sm text-zinc-600">Amount Payable</span>
            <span className="text-2xl font-bold text-zinc-900">₹{rupees(fees.total)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
