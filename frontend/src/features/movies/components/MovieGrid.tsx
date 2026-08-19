"use client";

import { useEffect, useState } from "react";

import { ApiHealth } from "@/common/components/ApiHealth";
import { useCity } from "@/features/city/store/city-context";
import { listMovies } from "@/features/movies/api/movies";
import { MovieCard } from "@/features/movies/components/MovieCard";
import type { Movie } from "@/features/movies/types";

export function MovieGrid({
  premiere,
  excludeIds,
}: {
  /** Undefined shows every movie; true or false narrows to premieres or the rest. */
  premiere?: boolean;
  excludeIds?: string[];
}) {
  const { city, openPicker } = useCity();
  const dark = premiere === true;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    listMovies({ city, premiere })
      .then((data) => {
        setMovies(data.items);
        setError("");
      })
      .catch(() => setError("Could not load movies. Is the API running?"))
      .finally(() => setLoading(false));
  }, [city, premiere]);

  if (error) {
    return (
      <div>
        <p className="text-red-500">{error}</p>
        <ApiHealth />
      </div>
    );
  }
  if (loading) {
    return <p className={dark ? "text-zinc-400" : "text-zinc-500"}>Loading movies…</p>;
  }

  const visible = excludeIds
    ? movies.filter((movie) => !excludeIds.includes(movie.id))
    : movies;

  if (visible.length === 0) {
    return (
      <p className={dark ? "text-zinc-400" : "text-zinc-500"}>
        Nothing playing in {city} right now.{" "}
        <button
          type="button"
          onClick={openPicker}
          className="font-medium text-[#f84464] hover:underline"
        >
          Try another city
        </button>
      </p>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-2 sm:gap-8">
      {visible.map((movie) => (
        <MovieCard key={movie.id} movie={movie} premiere={dark} />
      ))}
    </div>
  );
}
