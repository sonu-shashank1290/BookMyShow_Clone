"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AccessibilityIcon,
  BackIcon,
  InfoIcon,
  MinusIcon,
  PencilIcon,
  PlusIcon,
} from "@/common/components/Icons";
import { ApiError } from "@/common/lib/api";
import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import { createBooking } from "@/features/booking/api/booking";
import { useAuth } from "@/features/auth/store/auth-context";
import { SeatCountModal } from "@/features/seats/components/SeatCountModal";
import { SeatGrid } from "@/features/seats/components/SeatGrid";
import { getSeatMap, lockSeats, unlockSeats } from "@/features/seats/api/seats";
import { findBestBlock } from "@/features/seats/lib/continuous";
import type { Seat, SeatMap as SeatMapType } from "@/features/seats/types";
import { listShows, getShow } from "@/features/shows/api/shows";
import type { Show, Showtime } from "@/features/shows/types";

function readQty(raw: string | null): number | null {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 10) return null;
  return value;
}

export function SeatMap({ showId }: { showId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, ready, user } = useAuth();
  const qtyFromUrl = readQty(searchParams.get("qty"));
  const [show, setShow] = useState<Show | null>(null);
  const [map, setMap] = useState<SeatMapType | null>(null);
  const [siblings, setSiblings] = useState<Showtime[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const [seatCount, setSeatCount] = useState(qtyFromUrl ?? 1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [countChosen, setCountChosen] = useState(qtyFromUrl !== null);
  const [zoom, setZoom] = useState(1);

  async function refresh() {
    const nextShow = await getShow(showId);
    const nextMap = await getSeatMap(showId, token);
    setShow(nextShow);
    setMap(nextMap);
    const listed = await listShows(nextShow.movie_id, nextShow.date, {
      city: nextShow.city ?? undefined,
    });
    const cinema = listed.cinemas.find((item) => item.cinema_id === nextShow.cinema_id);
    setSiblings(cinema ? cinema.screens.flatMap((screen) => screen.showtimes) : []);
  }

  useEffect(() => {
    if (!ready) return;
    refresh().catch(() => setError("Could not load seats"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showId, token]);

  useEffect(() => {
    setCountChosen(readQty(searchParams.get("qty")) !== null);
    setPickerOpen(false);
    // Re-decide the ticket-count modal whenever the show (or qty) changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  useEffect(() => {
    if (!map || countChosen) return;
    const held = map.rows.flatMap((row) =>
      row.seats.filter((seat) => seat.locked_by_me).map((seat) => seat.id),
    );
    if (held.length > 0) {
      setSeatCount(held.length);
      setCountChosen(true);
      setPickerOpen(false);
      router.replace(`/booking/${showId}/seats?qty=${held.length}`, { scroll: false });
      return;
    }
    setPickerOpen(true);
  }, [map, countChosen]);

  useEffect(() => {
    if (qtyFromUrl === null) return;
    setSeatCount(qtyFromUrl);
    setPickerOpen(false);
    setCountChosen(true);
  }, [qtyFromUrl]);

  const mine = useMemo(() => {
    if (!map) return [];
    return map.rows.flatMap((row) =>
      row.seats.filter((seat) => seat.locked_by_me).map((seat) => seat.id),
    );
  }, [map]);

  const amount = useMemo(() => {
    if (!map) return 0;
    let total = 0;
    for (const row of map.rows) {
      for (const seat of row.seats) {
        if (seat.locked_by_me) {
          total += map.price_tiers[row.tier] ?? 0;
        }
      }
    }
    return total;
  }, [map]);

  const seatsHref = (id: string) =>
    qtyFromUrl !== null || !pickerOpen
      ? `/booking/${id}/seats?qty=${seatCount}`
      : `/booking/${id}/seats`;

  async function unlockAll(ids: string[]) {
    if (!token || ids.length === 0) return;
    await unlockSeats(showId, ids, token);
  }

  async function persistCount(count: number) {
    setSeatCount(count);
    router.replace(`/booking/${showId}/seats?qty=${count}`, { scroll: false });
  }

  async function onConfirmCount() {
    const previous = mine.length;
    setPickerOpen(false);
    setCountChosen(true);
    await persistCount(seatCount);
    if (previous > 0 && previous !== seatCount) {
      await unlockAll(mine);
      await refresh().catch(() => undefined);
    }
  }

  async function onSeatClick(seat: Seat) {
    if (!user || !token) {
      router.push(`/login?next=${encodeURIComponent(seatsHref(showId))}`);
      return;
    }
    if (seat.status === "booked" || (seat.status === "locked" && !seat.locked_by_me)) {
      return;
    }
    if (!map) return;
    setError("");
    setNotice("");
    try {
      if (seat.locked_by_me) {
        await unlockSeats(showId, [seat.id], token);
        await refresh();
        return;
      }

      const remaining = seatCount - mine.length;
      if (remaining <= 0) {
        setNotice(`You already selected ${seatCount} seats. Unselect one to change.`);
        return;
      }

      const row = map.rows.find((item) => item.seats.some((itemSeat) => itemSeat.id === seat.id));
      const result = row ? findBestBlock(row, seat, remaining, false) : null;
      if (!result) {
        setError("No seats available here. Pick another seat.");
        return;
      }

      const leftover = remaining - result.allocated;
      if (leftover > 0) {
        setNotice(
          `Selected ${result.allocated} here. Pick ${leftover} more in any category.`,
        );
      }

      await lockSeats(
        showId,
        result.seats.map((item) => item.id),
        token,
      );
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update seat");
      await refresh().catch(() => undefined);
    }
  }

  async function onBook() {
    if (!token || !map) return;
    if (mine.length !== seatCount) {
      setError(`Select ${seatCount} seat${seatCount > 1 ? "s" : ""} to continue`);
      return;
    }
    setPending(true);
    setError("");
    setNotice("");
    try {
      const booking = await createBooking(showId, mine, token);
      router.push(`/payment/${booking.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create booking");
    } finally {
      setPending(false);
    }
  }

  if (!map || !show) {
    return <p className="p-6 text-zinc-500">Loading seat map…</p>;
  }

  const language = show.languages?.[0] ?? "";
  const remaining = seatCount - mine.length;
  const readyToPay = mine.length === seatCount;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-[#eee] bg-white">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link href={`/movies/${show.movie_id}/buytickets`} className="shrink-0 text-[#333]">
            <BackIcon />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[16px] font-semibold text-[#1f1f1f]">
              {show.movie_title ?? "Movie"}
              {language ? ` - ${language}` : ""}
            </h1>
            <p className="truncate text-[12px] text-[#8a8a8a]">
              {show.cinema_name} | {formatShowDate(show.date, "short")} |{" "}
              {formatTime12(show.start_time)}
            </p>
          </div>
          <span className="hidden text-[#8a8a8a] sm:inline">
            <AccessibilityIcon />
          </span>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#f84464] bg-[#fff1f4] px-3 py-1 text-[12px] font-medium text-[#f84464]"
          >
            {seatCount} Ticket{seatCount > 1 ? "s" : ""} <PencilIcon size={11} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto bg-white px-4 py-2.5">
          {siblings.map((item) => {
            const active = item.show_id === showId;
            return (
              <Link
                key={item.show_id}
                href={seatsHref(item.show_id)}
                className={`shrink-0 rounded-md border px-3 py-1.5 text-center ${
                  active
                    ? "border-[#4caf50] bg-[#4caf50] text-white"
                    : "border-[#4caf50] bg-white text-[#333]"
                }`}
              >
                <span className="block text-[13px] font-medium">{formatTime12(item.start_time)}</span>
                {item.format ? (
                  <span className={`block text-[9px] uppercase tracking-wide ${active ? "text-white/90" : "text-[#8a8a8a]"}`}>
                    {item.format}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </header>

      {ready && !user ? (
        <div className="flex flex-wrap items-center justify-center gap-3 border-b border-[#eee] bg-[#fff8e8] px-4 py-2.5 text-[13px] text-[#333]">
          <span>Sign in or create an account to lock seats.</span>
          <Link href={`/login?next=${encodeURIComponent(seatsHref(showId))}`} className="font-semibold text-[#f84464]">
            Sign in
          </Link>
          <Link href={`/signup?next=${encodeURIComponent(seatsHref(showId))}`} className="font-semibold text-[#f84464]">
            Sign up
          </Link>
        </div>
      ) : null}

      <SeatCountModal
        open={pickerOpen}
        count={seatCount}
        onChange={setSeatCount}
        onConfirm={() => {
          void onConfirmCount();
        }}
        priceTiers={map.price_tiers}
        rows={map.rows}
      />

      <div className="relative flex-1 overflow-auto bg-white">
        <div className="w-max min-w-full">
          <SeatGrid map={map} zoom={zoom} onSeatClick={onSeatClick} />
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((value) => Math.min(1.45, Number((value + 0.12).toFixed(2))))}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] bg-white text-[#666] shadow-sm"
          >
            <PlusIcon />
          </button>
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((value) => Math.max(0.7, Number((value - 0.12).toFixed(2))))}
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd] bg-white text-[#666] shadow-sm"
          >
            <MinusIcon />
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 bg-white">
        <div className="flex flex-wrap justify-center gap-6 px-4 py-3 text-[12px] text-[#757575]">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-4 w-4 rounded-[3px] border border-[#9ccc65] bg-white" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-4 w-4 rounded-[3px] bg-[#e0e0e0]" />
            Sold
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-4 w-4 rounded-[3px] border border-[#f5c518] bg-white" />
            Bestseller
            <InfoIcon className="text-[#bdbdbd]" />
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-4 w-4 rounded-[3px] bg-[#4caf50]" />
            Selected
          </span>
        </div>
        {error ? <p className="px-4 pb-2 text-center text-[13px] text-red-500">{error}</p> : null}
        {notice && !error ? (
          <p className="px-4 pb-2 text-center text-[13px] text-[#1677a3]">{notice}</p>
        ) : null}
        {!readyToPay && !error && !notice ? (
          <p className="px-4 pb-2 text-center text-[13px] text-[#888]">
            {mine.length === 0
              ? `Select ${seatCount} seat${seatCount > 1 ? "s" : ""}`
              : `Select ${remaining} more seat${remaining > 1 ? "s" : ""} in any category`}
          </p>
        ) : null}
        {readyToPay ? (
          <div className="px-4 py-3">
            <button
              type="button"
              disabled={pending}
              onClick={onBook}
              className="w-full rounded bg-[#f84464] py-3 text-[15px] font-semibold text-white hover:bg-[#e03858] disabled:opacity-50"
            >
              {pending ? "Booking…" : `Pay ₹ ${rupees(amount)}`}
            </button>
          </div>
        ) : (
          <div className="h-2" />
        )}
      </div>
    </div>
  );
}
