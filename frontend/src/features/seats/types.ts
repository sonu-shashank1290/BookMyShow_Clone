export type SeatStatus = "available" | "locked" | "booked";

export type Seat = {
  id: string;
  status: SeatStatus;
  locked_by_me: boolean;
};

export type SeatRow = {
  row: string;
  tier: string;
  seats: Seat[];
};

export type SeatMap = {
  show_id: string;
  price_tiers: Record<string, number>;
  rows: SeatRow[];
};
