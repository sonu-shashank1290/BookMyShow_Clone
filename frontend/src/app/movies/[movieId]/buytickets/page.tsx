"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { formatDuration } from "@/common/lib/dates";
import { useCity } from "@/features/city/store/city-context";
import { getMovie } from "@/features/movies/api/movies";
import type { Movie } from "@/features/movies/types";
import { MovieShowtimes } from "@/features/shows/components/MovieShowtimes";

function BuyTicketsPageInner() {
  const params = useParams<{ movieId: string }>();
  const searchParams = useSearchParams();
  const { city } = useCity();
  const [movie, setMovie] = useState<Movie | null>(null);
  const language = searchParams.get("language");
  const format = searchParams.get("format");

  useEffect(() => {
    if (!city) return;
    getMovie(params.movieId, city).then(setMovie).catch(() => setMovie(null));
  }, [params.movieId, city]);

  const tags = movie
    ? [
        movie.duration_mins ? formatDuration(movie.duration_mins) : "",
        movie.rating,
        ...movie.genre,
        format,
      ].filter(Boolean)
    : [];

  return (
    <main className="bg-[#f2f5fa]">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-[1240px] px-6 py-5">
          <h1 className="text-[24px] font-bold text-[#333]">
            {movie
              ? `${movie.title}${language ? ` - (${language})` : ""}`
              : "Showtimes"}
          </h1>
          {tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-300 px-2.5 py-0.5 text-[12px] text-[#666]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mx-auto max-w-[1240px] px-6 py-4">
        <MovieShowtimes
          movieId={params.movieId}
          initialLanguage={language ?? undefined}
          initialFormat={format ?? undefined}
        />
      </div>
    </main>
  );
}

export default function BuyTicketsPage() {
  return (
    <Suspense fallback={<main className="px-6 py-10 text-zinc-500">Loading showtimes…</main>}>
      <BuyTicketsPageInner />
    </Suspense>
  );
}
