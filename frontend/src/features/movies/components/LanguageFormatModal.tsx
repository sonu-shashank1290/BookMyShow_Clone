"use client";

import { useRouter } from "next/navigation";

import type { Movie } from "@/features/movies/types";

export function LanguageFormatModal({
  movie,
  open,
  onClose,
}: {
  movie: Movie;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!open) return null;

  const groups = Object.entries(
    movie.language_formats && Object.keys(movie.language_formats).length
      ? movie.language_formats
      : Object.fromEntries((movie.language || []).map((lang) => [lang, movie.formats || ["2D"]])),
  );

  function go(language: string, format: string) {
    const query = new URLSearchParams({ language, format });
    router.push(`/movies/${movie.id}/buytickets?${query.toString()}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between px-5 pt-4">
          <div>
            <p className="text-xs text-zinc-500">{movie.title}</p>
            <h2 className="text-lg font-bold text-zinc-900">Select language and format</h2>
          </div>
          <button type="button" onClick={onClose} className="text-xl text-zinc-400 hover:text-zinc-700">
            ×
          </button>
        </div>
        <div className="mt-3 max-h-[60vh] overflow-y-auto pb-5">
          {groups.map(([language, formats]) => (
            <div key={language}>
              <p className="bg-[#f5f5f5] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {language}
              </p>
              <div className="flex flex-wrap gap-2 px-5 py-3">
                {formats.map((format) => (
                  <button
                    key={format}
                    type="button"
                    onClick={() => go(language, format)}
                    className="rounded-full border border-[#f84464] px-4 py-1.5 text-sm font-medium text-[#f84464] hover:bg-[#fff0f3]"
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
