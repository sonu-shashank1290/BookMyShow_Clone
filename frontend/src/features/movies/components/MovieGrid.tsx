"use client";

import { useEffect, useState } from "react";

import { ApiHealth } from "@/common/components/ApiHealth";
import { listMovies } from "@/features/movies/api/movies";
import { MovieCard } from "@/features/movies/components/MovieCard";
import type { Movie } from "@/features/movies/types";

export function MovieGrid({
  premiere = false,
  excludeIds,
}: {
  premiere?: boolean;
  excludeIds?: string[];
}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listMovies()
      .then((data) => setMovies(data.items))
      .catch(() => setError("Could not load movies. Is the API running?"));
  }, []);

  if (error) {
    return (
      <div>
        <p className="text-red-500">{error}</p>
        <ApiHealth />
      </div>
    );
  }
  if (movies.length === 0) {
    return <p className={premiere ? "text-zinc-400" : "text-zinc-500"}>Loading movies…</p>;
  }

  const visible = excludeIds
    ? movies.filter((movie) => !excludeIds.includes(movie.id))
    : movies;

  return (
    <div className="flex gap-6 overflow-x-auto pb-2 sm:gap-8">
      {visible.map((movie) => (
        <MovieCard key={movie.id} movie={movie} premiere={premiere} />
      ))}
    </div>
  );
}
