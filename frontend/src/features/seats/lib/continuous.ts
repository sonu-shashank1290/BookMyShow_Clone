import type { Seat, SeatRow } from "@/features/seats/types";

function seatNumber(seatId: string, rowLetter: string): number {
  return Number(seatId.slice(rowLetter.length));
}

export function isSelectable(seat: Seat): boolean {
  return seat.status === "available" || seat.locked_by_me;
}

export function findContinuousBlock(
  row: SeatRow,
  clicked: Seat,
  count: number,
): Seat[] | null {
  const start = row.seats.findIndex((seat) => seat.id === clicked.id);
  if (start < 0) return null;
  if (count === 1) return isSelectable(clicked) ? [clicked] : null;

  for (let offset = 0; offset < count; offset += 1) {
    const from = start - offset;
    if (from < 0 || from + count > row.seats.length) continue;
    const block = row.seats.slice(from, from + count);
    const nums = block.map((seat) => seatNumber(seat.id, row.row));
    const consecutive = nums.every((num, index) => index === 0 || num === nums[index - 1] + 1);
    if (consecutive && block.every(isSelectable)) return block;
  }
  return null;
}

export function areContinuous(seatIds: string[], rows: SeatRow[]): boolean {
  if (seatIds.length <= 1) return true;
  const row = rows.find((item) =>
    seatIds.every((id) => item.seats.some((seat) => seat.id === id)),
  );
  if (!row) return false;
  const nums = seatIds.map((id) => seatNumber(id, row.row)).sort((a, b) => a - b);
  return nums.every((num, index) => index === 0 || num === nums[index - 1] + 1);
}
