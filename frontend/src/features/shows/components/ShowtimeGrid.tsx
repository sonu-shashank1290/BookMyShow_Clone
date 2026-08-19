import Link from "next/link";

import { formatTime12 } from "@/common/lib/dates";
import type { CinemaShowtimes } from "@/features/shows/types";

export function ShowtimeGrid({ cinemas }: { cinemas: CinemaShowtimes[] }) {
  if (cinemas.length === 0) {
    return (
      <p className="px-1 py-6 text-sm text-zinc-500">
        No shows on this date. Try another day.
      </p>
    );
  }

  return (
    <div className="divide-y divide-zinc-200 bg-white">
      {cinemas.map((cinema) => {
        const times = cinema.screens.flatMap((screen) =>
          screen.showtimes.map((show) => ({
            ...show,
            screen_name: screen.screen_name,
          })),
        );
        return (
          <section key={cinema.cinema_id} className="px-5 py-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[16px] font-medium text-[#333]">{cinema.cinema_name}</h3>
                <div className="mt-1 flex flex-wrap gap-3 text-[12px]">
                  {(cinema.amenities ?? ["M-Ticket", "Food & Beverage"]).map((amenity) => (
                    <span key={amenity} className="text-[#49ba8e]">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-zinc-300">♡</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {times.map((show) => (
                <Link
                  key={show.show_id}
                  href={`/booking/${show.show_id}/seats`}
                  className="min-w-[96px] rounded border border-[#49ba8e] px-3 py-2.5 text-center text-[14px] text-[#49ba8e] hover:bg-emerald-50"
                >
                  {formatTime12(show.start_time)}
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
