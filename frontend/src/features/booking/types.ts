export type Booking = {
  id: string;
  user_id: string;
  show_id: string;
  seats: string[];
  amount: number;
  status: string;
  payment_id?: string | null;
  created_at?: string | null;
  movie_title?: string | null;
  movie_rating?: string | null;
  languages?: string[] | null;
  cinema_name?: string | null;
  cinema_address?: string | null;
  screen_name?: string | null;
  show_date?: string | null;
  start_time?: string | null;
};

export type BookingList = {
  items: Booking[];
};

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  status: string;
  provider_ref: string;
  booking: Booking;
};
