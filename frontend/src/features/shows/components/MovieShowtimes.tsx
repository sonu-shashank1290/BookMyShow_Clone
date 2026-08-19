"use client";

import { useEffect, useState } from "react";

import { nextDays } from "@/common/lib/dates";
import { listShows } from "@/features/shows/api/shows";
import { DateStrip } from "@/features/shows/components/DateStrip";
import { ShowtimeGrid } from "@/features/shows/components/ShowtimeGrid";
import type { CinemaShowtimes } from "@/features/shows/types";

export function MovieShowtimes({ movieId }: { movieId: string }) {
  const dates = nextDays(7);
  const [date, setDate] = useState(dates[0]);
  const [cinemas, setCinemas] = useState<CinemaShowtimes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listShows(movieId, date)
      .then((data) => setCinemas(data.cinemas))
      .catch(() => setCinemas([]))
      .finally(() => setLoading(false));
  }, [movieId, date]);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <DateStrip dates={dates} selected={date} onSelect={setDate} />
      <div className="flex flex-wrap gap-2 border-b border-zinc-100 px-4 py-3">
        {["Hindi 2D", "Price Range", "Showtimes"].map((filter) => (
          <span
            key={filter}
            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600"
          >
            {filter}
          </span>
        ))}
      </div>
      {loading ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Loading showtimes…</p>
      ) : (
        <ShowtimeGrid cinemas={cinemas} />
      )}
    </div>
  );
}
