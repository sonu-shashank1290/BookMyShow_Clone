import Link from "next/link";

import { StarIcon } from "@/common/components/Icons";
import { formatVotes } from "@/common/lib/dates";
import type { Movie } from "@/features/movies/types";

export function MovieCard({
  movie,
  premiere = false,
}: {
  movie: Movie;
  premiere?: boolean;
}) {
  const score = movie.vote_average ? movie.vote_average.toFixed(1) : "—";

  return (
    <Link href={`/movies/${movie.id}`} className="group block w-[160px] shrink-0 sm:w-[222px]">
      <div className="relative overflow-hidden rounded-lg bg-zinc-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="h-[240px] w-full object-cover sm:h-[333px]"
          onError={(event) => {
            event.currentTarget.src = `https://picsum.photos/seed/${movie.id}/300/450`;
          }}
        />
        {premiere ? (
          <span className="absolute bottom-2 left-2 rounded bg-[#f84464] px-1.5 py-0.5 text-[11px] font-bold uppercase text-white">
            Premiere
          </span>
        ) : (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-black/80 px-2.5 py-1.5 text-[13px] text-white">
            <StarIcon className="text-[#f84464]" size={13} />
            <span className="font-medium">{score}/10</span>
            <span className="text-[12px] text-zinc-300">
              {formatVotes(movie.vote_count ?? 0)}
            </span>
          </div>
        )}
      </div>
      <h2
        className={`mt-2.5 line-clamp-2 text-[16px] font-medium leading-5 group-hover:text-[#f84464] ${
          premiere ? "text-white" : "text-[#222]"
        }`}
      >
        {movie.title}
      </h2>
      <p className={`mt-1 text-[14px] leading-5 ${premiere ? "text-zinc-400" : "text-[#666]"}`}>
        {premiere ? movie.language.join("/") : movie.genre.join("/")}
      </p>
    </Link>
  );
}
