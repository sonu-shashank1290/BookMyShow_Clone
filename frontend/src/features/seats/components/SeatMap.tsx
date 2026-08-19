"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { BackIcon, PencilIcon } from "@/common/components/Icons";
import { ApiError } from "@/common/lib/api";
import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import { createBooking } from "@/features/booking/api/booking";
import { useAuth } from "@/features/auth/store/auth-context";
import { SeatCountModal } from "@/features/seats/components/SeatCountModal";
import { getSeatMap, lockSeat, unlockSeat } from "@/features/seats/api/seats";
import { areContinuous, findContinuousBlock } from "@/features/seats/lib/continuous";
import type { Seat, SeatMap as SeatMapType } from "@/features/seats/types";
import { listShows, getShow } from "@/features/shows/api/shows";
import type { Show, Showtime } from "@/features/shows/types";

const TIER_LABELS: Record<string, string> = {
  recliner: "RECLINER",
  prime: "PRIME",
  classic: "CLASSIC",
  classic_plus: "CLASSIC PLUS",
};

function readQty(raw: string | null): number | null {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 10) return null;
  return value;
}

function seatClass(seat: Seat, bestseller: boolean): string {
  if (seat.status === "booked") {
    return "bg-zinc-300 text-white cursor-not-allowed";
  }
  if (seat.status === "locked" && !seat.locked_by_me) {
    return "bg-zinc-300 text-white cursor-not-allowed";
  }
  if (seat.locked_by_me) {
    return "bg-emerald-500 text-white border border-emerald-500";
  }
  if (bestseller) {
    return "bg-white text-amber-600 border border-amber-400 hover:bg-amber-50";
  }
  return "bg-white text-emerald-700 border border-emerald-500 hover:bg-emerald-50";
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
  const [pending, setPending] = useState(false);
  const [seatCount, setSeatCount] = useState(qtyFromUrl ?? 1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [countChosen, setCountChosen] = useState(qtyFromUrl !== null);

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
    if (!token) return;
    await Promise.all(ids.map((id) => unlockSeat(showId, id, token)));
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
    // Drop the hold only when the ticket count actually changed.
    // Confirming the same number (or reopening the show) must keep the lock.
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
    try {
      if (seat.locked_by_me) {
        await unlockAll(mine);
        await refresh();
        return;
      }

      const row = map.rows.find((item) => item.seats.some((itemSeat) => itemSeat.id === seat.id));
      const block = row ? findContinuousBlock(row, seat, seatCount) : null;
      if (!block) {
        setError(
          `No ${seatCount} seat${seatCount > 1 ? "s" : ""} together here. Pick another seat.`,
        );
        return;
      }

      const nextIds = new Set(block.map((item) => item.id));
      await unlockAll(mine.filter((id) => !nextIds.has(id)));
      await Promise.all(
        block.filter((item) => !item.locked_by_me).map((item) => lockSeat(showId, item.id, token)),
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
    if (!areContinuous(mine, map.rows)) {
      setError("Select seats together in the same row");
      return;
    }
    setPending(true);
    setError("");
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
  const readyToPay = mine.length === seatCount && areContinuous(mine, map.rows);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b border-zinc-200 bg-white">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/movies/${show.movie_id}/buytickets`} className="text-zinc-600">
            <BackIcon />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold text-zinc-900">
              {show.movie_title ?? "Movie"}
              {language ? ` - ${language}` : ""}
            </h1>
            <p className="truncate text-xs text-zinc-500">
              {show.cinema_name} | {formatShowDate(show.date, "short")} |{" "}
              {formatTime12(show.start_time)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1 rounded border border-[#f84464] px-2 py-1 text-[12px] font-semibold text-[#f84464]"
          >
            {seatCount} Ticket{seatCount > 1 ? "s" : ""} <PencilIcon size={11} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto bg-[#f7f7f7] px-4 py-2">
          {siblings.map((item) => {
            const active = item.show_id === showId;
            return (
              <Link
                key={item.show_id}
                href={seatsHref(item.show_id)}
                className={`shrink-0 rounded border px-3 py-1.5 text-xs ${
                  active
                    ? "border-amber-400 bg-amber-400 text-white"
                    : "border-amber-400 bg-white text-zinc-800"
                }`}
              >
                {formatTime12(item.start_time)}
              </Link>
            );
          })}
        </div>
      </header>

      <SeatCountModal
        open={pickerOpen}
        count={seatCount}
        onChange={setSeatCount}
        onConfirm={() => {
          void onConfirmCount();
        }}
        priceTiers={map.price_tiers}
      />

      <div className="flex-1 overflow-x-auto px-4 py-6">
        <div className="mx-auto min-w-max space-y-5">
          {map.rows.map((row, index) => {
            const prev = map.rows[index - 1];
            const showTier = !prev || prev.tier !== row.tier;
            return (
              <div key={row.row}>
                {showTier ? (
                  <p className="mb-2 text-right text-[11px] uppercase tracking-wide text-zinc-400">
                    ₹{map.price_tiers[row.tier] ?? 0} {TIER_LABELS[row.tier] ?? row.tier}
                  </p>
                ) : null}
                <div className="flex items-center gap-3">
                  <span className="w-5 text-xs text-zinc-500">{row.row}</span>
                  <div className="flex gap-1.5">
                    {row.seats.map((seat) => (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => onSeatClick(seat)}
                        className={`h-7 w-7 rounded-[3px] text-[10px] ${seatClass(
                          seat,
                          row.tier === "classic_plus",
                        )}`}
                        title={`${seat.id} · ${row.tier} · ${seat.status}`}
                      >
                        {seat.id.replace(row.row, "").padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="pt-6 text-center">
            <div className="mx-auto h-3 w-64 bg-gradient-to-b from-sky-200 to-transparent [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)]" />
            <p className="mt-2 text-[11px] tracking-wide text-zinc-400">
              All eyes this way please
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white">
        <div className="flex flex-wrap justify-center gap-4 px-4 py-3 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-[2px] border border-emerald-500 bg-white" />{" "}
            Available
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-[2px] bg-zinc-300" /> Sold
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-[2px] border border-amber-400 bg-white" />{" "}
            Bestseller
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="inline-block h-3 w-3 rounded-[2px] bg-emerald-500" /> Selected
          </span>
        </div>
        {error ? <p className="px-4 text-center text-sm text-red-500">{error}</p> : null}
        {!readyToPay && !error ? (
          <p className="px-4 pb-2 text-center text-sm text-zinc-500">
            Select {seatCount} seat{seatCount > 1 ? "s" : ""} together
          </p>
        ) : null}
        <div className="px-4 pb-4">
          <button
            type="button"
            disabled={pending || !readyToPay}
            onClick={onBook}
            className="w-full rounded-md bg-[#f84464] py-3 text-sm font-semibold text-white hover:bg-[#e03858] disabled:opacity-50"
          >
            {pending ? "Booking…" : `Pay ₹ ${rupees(amount)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
