import type { SeatRow } from "@/features/seats/types";
import { seatNumber } from "@/features/seats/lib/continuous";

export const TIER_ORDER = ["recliner", "prime", "classic", "classic_plus"] as const;

export const TIER_LABELS: Record<string, string> = {
  recliner: "RECLINER",
  prime: "PRIME",
  classic: "CLASSIC",
  classic_plus: "CLASSIC PLUS",
};

export type FillStatus = "AVAILABLE" | "FAST FILLING" | "SOLD OUT";

/** Visual aisle sits after this seat number so left/right blocks line up. */
export const AISLE_AFTER = 8;

export function orderedTiers(priceTiers: Record<string, number>): string[] {
  const known = TIER_ORDER.filter((tier) => tier in priceTiers);
  const extra = Object.keys(priceTiers).filter(
    (tier) => !(TIER_ORDER as readonly string[]).includes(tier),
  );
  return [...known, ...extra];
}

export function tierFillStatus(rows: SeatRow[], tier: string): FillStatus {
  const seats = rows.filter((row) => row.tier === tier).flatMap((row) => row.seats);
  if (seats.length === 0) return "SOLD OUT";
  const free = seats.filter((seat) => seat.status === "available" || seat.locked_by_me).length;
  if (free === 0) return "SOLD OUT";
  if (free / seats.length <= 0.3) return "FAST FILLING";
  return "AVAILABLE";
}

export function aisleAfterSeatNumber(seatNum: number): boolean {
  return seatNum === AISLE_AFTER;
}

export function maxSeatNumber(rows: SeatRow[]): number {
  let max = 0;
  for (const row of rows) {
    for (const seat of row.seats) {
      const num = seatNumber(seat.id, row.row);
      if (num > max) max = num;
    }
  }
  return max;
}
