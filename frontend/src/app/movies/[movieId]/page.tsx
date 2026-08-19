"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { DummyLink } from "@/common/components/DummyLink";
import { PlayIcon, ShareIcon, StarIcon } from "@/common/components/Icons";
import { formatDuration, formatRelease, formatVotes } from "@/common/lib/dates";
import { getMovie } from "@/features/movies/api/movies";
import { LanguageFormatModal } from "@/features/movies/components/LanguageFormatModal";
import { MovieGrid } from "@/features/movies/components/MovieGrid";
import type { Movie, MoviePerson } from "@/features/movies/types";

const OFFERS = [
  {
    title: "Enjoy B1G1 Ticket Free!* with Bandhan Bank Legacy Debit Cards",
    subtitle: "Tap to view details",
  },
  {
    title: "Buy 1 get 1 movie ticket free + 50% off on snacks",
    subtitle: "Tap to view details",
  },
];

export default function MovieDetailPage() {
  const params = useParams<{ movieId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getMovie(params.movieId)
      .then(setMovie)
      .catch(() => setError("Movie not found"));
  }, [params.movieId]);

  if (error) {
    return <main className="mx-auto max-w-[1240px] px-6 py-10 text-red-500">{error}</main>;
  }
  if (!movie) {
    return <main className="mx-auto max-w-[1240px] px-6 py-10 text-zinc-500">Loading…</main>;
  }

  const backdrop = movie.backdrop_url || movie.poster_url;

  return (
    <main className="bg-white">
      <section
        className="relative text-white"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(26,26,26,0.96) 28%, rgba(26,26,26,0.7)), url(${backdrop})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <DummyLink className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1 text-[12px]">
          <ShareIcon size={13} /> Share
        </DummyLink>
        <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-6 py-10 sm:flex-row sm:items-center">
          <div className="relative w-[220px] shrink-0 overflow-hidden rounded-xl shadow-2xl sm:w-[261px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="h-[330px] w-full object-cover sm:h-[392px]"
              onError={(event) => {
                event.currentTarget.src = `https://picsum.photos/seed/${movie.id}/300/450`;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[12px]">
                <PlayIcon size={10} /> Trailers
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1.5 text-center text-[13px]">
              In cinemas
            </div>
          </div>

          <div className="flex-1 pb-1">
            <h1 className="text-[32px] font-bold leading-tight sm:text-[36px]">{movie.title}</h1>
            <div className="mt-5 flex max-w-xl flex-wrap items-center gap-3 rounded-md bg-white/10 px-4 py-3">
              <p className="inline-flex items-center gap-1.5 text-[16px]">
                <StarIcon className="text-[#f84464]" size={16} />
                <span className="font-semibold">
                  {movie.vote_average ? movie.vote_average.toFixed(1) : "—"}/10
                </span>
                <span className="text-[13px] text-zinc-300">
                  {formatVotes(movie.vote_count ?? 0)}
                </span>
              </p>
              <DummyLink className="ml-auto rounded border border-white/40 px-3 py-1.5 text-[12px] font-semibold">
                I&apos;m interested
              </DummyLink>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-[13px]">
              {(movie.formats?.length ? movie.formats : ["2D"]).map((item) => (
                <span key={item} className="rounded bg-white/15 px-2.5 py-1 font-medium">
                  {item}
                </span>
              ))}
              {movie.language.map((item) => (
                <span key={item} className="rounded bg-white/15 px-2.5 py-1 font-medium">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[15px] text-zinc-200">
              {formatDuration(movie.duration_mins)} • {movie.genre.join(", ")}
              {movie.rating ? ` • ${movie.rating}` : ""}
              {movie.release_date ? ` • ${formatRelease(movie.release_date)}` : ""}
            </p>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-7 rounded-md bg-[#f84464] px-14 py-3 text-[18px] font-semibold text-white hover:bg-[#e03858]"
            >
              Book tickets
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] space-y-12 px-6 py-10">
        <div>
          <h2 className="text-[24px] font-bold text-[#333]">About the movie</h2>
          <p className="mt-3 max-w-4xl text-[16px] leading-7 text-[#333]">{movie.description}</p>
        </div>

        <div>
          <h2 className="text-[24px] font-bold text-[#333]">Top offers for you</h2>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {OFFERS.map((offer) => (
              <DummyLink
                key={offer.title}
                className="flex min-w-[280px] flex-1 items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-left"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f84464] text-white">
                  <TicketIcon />
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-zinc-800">{offer.title}</span>
                  <span className="text-[12px] text-zinc-500">{offer.subtitle}</span>
                </span>
              </DummyLink>
            ))}
          </div>
        </div>

        <PersonRow title="Cast" people={movie.cast} />
        <PersonRow title="Crew" people={movie.crew} />

        <div>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-[24px] font-bold text-[#333]">You might also like</h2>
            <DummyLink className="text-[14px] text-[#f84464]">View all ›</DummyLink>
          </div>
          <MovieGrid excludeIds={[movie.id]} />
        </div>
      </section>

      <LanguageFormatModal movie={movie} open={modalOpen} onClose={() => setModalOpen(false)} />
    </main>
  );
}

function PersonRow({ title, people }: { title: string; people?: MoviePerson[] }) {
  if (!people?.length) return null;
  return (
    <div>
      <h2 className="text-[24px] font-bold text-[#333]">{title}</h2>
      <div className="mt-4 flex gap-6 overflow-x-auto pb-2">
        {people.map((person) => (
          <div key={`${person.name}-${person.role}`} className="w-[120px] shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={person.photo_url}
              alt={person.name}
              className="mx-auto h-[120px] w-[120px] rounded-full object-cover"
            />
            <p className="mt-2 text-[14px] font-semibold text-[#333]">{person.name}</p>
            <p className="text-[13px] text-[#666]">{person.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TicketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v10" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
