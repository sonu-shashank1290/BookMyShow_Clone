"use client";

import { useEffect, useState } from "react";

import { nextDays } from "@/common/lib/dates";
import { useCity } from "@/features/city/store/city-context";
import { listShows } from "@/features/shows/api/shows";
import { DateStrip } from "@/features/shows/components/DateStrip";
import { ShowtimeGrid } from "@/features/shows/components/ShowtimeGrid";
import type { CinemaShowtimes } from "@/features/shows/types";

export function MovieShowtimes({
  movieId,
  initialLanguage,
  initialFormat,
}: {
  movieId: string;
  initialLanguage?: string;
  initialFormat?: string;
}) {
  const { city, openPicker } = useCity();
  const dates = nextDays(7);
  const [date, setDate] = useState(dates[0]);
  const [language, setLanguage] = useState(initialLanguage ?? "");
  const [format, setFormat] = useState(initialFormat ?? "");
  const [cinemas, setCinemas] = useState<CinemaShowtimes[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city) return;
    setLoading(true);
    listShows(movieId, date, { city, language, format })
      .then((data) => {
        setCinemas(data.cinemas);
        setLanguages(data.languages);
        setFormats(data.formats);
      })
      .catch(() => {
        setCinemas([]);
        setLanguages([]);
        setFormats([]);
      })
      .finally(() => setLoading(false));
  }, [movieId, date, city, language, format]);

  const filtered = Boolean(language || format);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <DateStrip dates={dates} selected={date} onSelect={setDate} />

      <div className="space-y-2 border-b border-zinc-100 px-4 py-3">
        <FilterRow
          label="Language"
          options={languages}
          selected={language}
          onSelect={setLanguage}
        />
        <FilterRow label="Format" options={formats} selected={format} onSelect={setFormat} />
        <div className="flex items-center gap-3 pt-1 text-[12px] text-[#666]">
          <button
            type="button"
            onClick={openPicker}
            className="font-medium text-[#f84464] hover:underline"
          >
            {city ?? "Select city"} ▾
          </button>
          {filtered ? (
            <button
              type="button"
              onClick={() => {
                setLanguage("");
                setFormat("");
              }}
              className="hover:text-[#333] hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <p className="px-4 py-6 text-sm text-zinc-500">Loading showtimes…</p>
      ) : cinemas.length === 0 && filtered ? (
        <p className="px-5 py-6 text-sm text-zinc-500">
          No {[language, format].filter(Boolean).join(" ")} shows in {city} on this date.
        </p>
      ) : (
        <ShowtimeGrid cinemas={cinemas} />
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-[62px] shrink-0 text-[12px] text-[#888]">{label}</span>
      <Pill active={!selected} onClick={() => onSelect("")}>
        All
      </Pill>
      {options.map((option) => (
        <Pill
          key={option}
          active={selected === option}
          onClick={() => onSelect(selected === option ? "" : option)}
        >
          {option}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-[#f84464] bg-[#f84464] text-white"
          : "border-zinc-200 text-zinc-600 hover:border-[#f84464] hover:text-[#f84464]"
      }`}
    >
      {children}
    </button>
  );
}
