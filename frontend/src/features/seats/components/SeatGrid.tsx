"use client";

import { Fragment } from "react";

import { TIER_LABELS, aisleAfterSeatNumber, maxSeatNumber } from "@/features/seats/lib/tiers";
import { seatNumber } from "@/features/seats/lib/continuous";
import type { Seat, SeatMap as SeatMapType } from "@/features/seats/types";

const SEAT = "h-[26px] w-[26px] shrink-0 rounded-[4px] text-[10px] font-medium leading-none";

function seatClass(seat: Seat, bestseller: boolean): string {
  if (seat.status === "booked" || (seat.status === "locked" && !seat.locked_by_me)) {
    return `${SEAT} cursor-not-allowed bg-[#e0e0e0] text-white`;
  }
  if (seat.locked_by_me) {
    return `${SEAT} bg-[#4caf50] text-white`;
  }
  if (bestseller) {
    return `${SEAT} border border-[#f5c518] bg-white text-[#9e9e9e] hover:bg-[#fffde7]`;
  }
  return `${SEAT} border border-[#9ccc65] bg-white text-[#9e9e9e] hover:border-[#7cb342] hover:text-[#616161]`;
}

export function SeatGrid({
  map,
  zoom,
  onSeatClick,
}: {
  map: SeatMapType;
  zoom: number;
  onSeatClick: (seat: Seat) => void;
}) {
  const columns = maxSeatNumber(map.rows);
  const colNums = Array.from({ length: columns }, (_, index) => index + 1);

  return (
    <div className="mx-auto py-6" style={{ zoom }}>
      {map.rows.map((row, index) => {
        const prev = map.rows[index - 1];
        const showTier = !prev || prev.tier !== row.tier;
        const price = map.price_tiers[row.tier] ?? 0;
        const byNumber = new Map(row.seats.map((seat) => [seatNumber(seat.id, row.row), seat]));
        return (
          <div key={row.row}>
            {showTier ? (
              <div className="relative mx-10 my-4">
                <div className="border-t border-[#e6e6e6]" />
                <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[12px] font-medium tracking-wide text-[#9e9e9e]">
                  ₹{price} {TIER_LABELS[row.tier] ?? row.tier}
                </p>
              </div>
            ) : null}
            <div className="flex items-center justify-center gap-1 py-[3px] pr-8">
              <span className="sticky left-0 z-10 mr-2 flex w-7 shrink-0 justify-center bg-white text-[12px] text-[#9e9e9e]">
                {row.row}
              </span>
              {colNums.map((num) => {
                const seat = byNumber.get(num);
                return (
                  <Fragment key={`${row.row}-${num}`}>
                    {aisleAfterSeatNumber(num - 1) ? (
                      <span className="w-6 shrink-0" aria-hidden />
                    ) : null}
                    {seat ? (
                      <button
                        type="button"
                        onClick={() => onSeatClick(seat)}
                        className={`flex items-center justify-center ${seatClass(
                          seat,
                          row.tier === "classic_plus",
                        )}`}
                        title={`${seat.id} · ${TIER_LABELS[row.tier] ?? row.tier}`}
                      >
                        {String(num).padStart(2, "0")}
                      </button>
                    ) : (
                      <span className="h-[26px] w-[26px] shrink-0" aria-hidden />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="px-10 pb-4 pt-12 text-center">
        <div className="mx-auto h-6 w-[min(640px,80vw)] bg-gradient-to-b from-[#c5e4f3] via-[#dceff8] to-transparent [clip-path:polygon(7%_0,93%_0,100%_100%,0_100%)]" />
        <p className="mt-2 text-[12px] tracking-[0.16em] text-[#c0c0c0]">All eyes this way please</p>
      </div>
    </div>
  );
}
