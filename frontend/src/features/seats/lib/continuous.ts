import { aisleAfterSeatNumber } from "@/features/seats/lib/tiers";
import type { Seat, SeatRow } from "@/features/seats/types";

export function seatNumber(seatId: string, rowLetter: string): number {
  return Number(seatId.slice(rowLetter.length));
}

export function isSelectable(seat: Seat, includeHeld = true): boolean {
  if (seat.status === "available") return true;
  return includeHeld && seat.locked_by_me;
}

function consecutiveInRow(left: Seat, right: Seat, row: SeatRow): boolean {
  const from = seatNumber(left.id, row.row);
  const to = seatNumber(right.id, row.row);
  if (to !== from + 1) return false;
  return !aisleAfterSeatNumber(from);
}

/** Longest free run in this row that includes the clicked seat. */
export function selectableRun(
  row: SeatRow,
  clicked: Seat,
  includeHeld = true,
): Seat[] | null {
  const start = row.seats.findIndex((seat) => seat.id === clicked.id);
  if (start < 0 || !isSelectable(clicked, includeHeld)) return null;

  let left = start;
  while (
    left > 0 &&
    isSelectable(row.seats[left - 1], includeHeld) &&
    consecutiveInRow(row.seats[left - 1], row.seats[left], row)
  ) {
    left -= 1;
  }

  let right = start;
  while (
    right + 1 < row.seats.length &&
    isSelectable(row.seats[right + 1], includeHeld) &&
    consecutiveInRow(row.seats[right], row.seats[right + 1], row)
  ) {
    right += 1;
  }

  return row.seats.slice(left, right + 1);
}

/**
 * Pick up to `count` seats together around the click.
 * If the pocket is smaller (booked seats, an aisle, or a short row),
 * take every free seat in that pocket instead of failing.
 */
export function findBestBlock(
  row: SeatRow,
  clicked: Seat,
  count: number,
  includeHeld = true,
): { seats: Seat[]; allocated: number } | null {
  const run = selectableRun(row, clicked, includeHeld);
  if (!run || run.length === 0) return null;

  const want = Math.max(1, count);
  if (run.length <= want) {
    return { seats: run, allocated: run.length };
  }

  const clickIdx = run.findIndex((seat) => seat.id === clicked.id);
  for (let offset = 0; offset < want; offset += 1) {
    const from = clickIdx - offset;
    if (from < 0 || from + want > run.length) continue;
    return { seats: run.slice(from, from + want), allocated: want };
  }

  return { seats: run.slice(0, want), allocated: want };
}

export function findContinuousBlock(
  row: SeatRow,
  clicked: Seat,
  count: number,
): Seat[] | null {
  return findBestBlock(row, clicked, count)?.seats ?? null;
}

export function areContinuous(seatIds: string[], rows: SeatRow[]): boolean {
  if (seatIds.length <= 1) return true;
  const row = rows.find((item) =>
    seatIds.every((id) => item.seats.some((seat) => seat.id === id)),
  );
  if (!row) return false;
  const nums = seatIds.map((id) => seatNumber(id, row.row)).sort((a, b) => a - b);
  return nums.every((num, index) => {
    if (index === 0) return true;
    const prev = nums[index - 1];
    return num === prev + 1 && !aisleAfterSeatNumber(prev);
  });
}
