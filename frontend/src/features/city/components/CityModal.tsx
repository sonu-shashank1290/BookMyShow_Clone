"use client";

import { useEffect, useState } from "react";

import { SearchIcon } from "@/common/components/Icons";
import { CityIcon } from "@/features/city/components/CityIcon";
import { nearestCity } from "@/features/city/lib/geo";
import { useCity } from "@/features/city/store/city-context";
import type { City } from "@/features/city/types";

export function CityModal() {
  const { city, cities, pickerOpen, setCity, closePicker } = useCity();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  useEffect(() => {
    if (!pickerOpen) return;
    setQuery("");
    setShowAll(false);
    setLocateError("");
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePicker();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pickerOpen, closePicker]);

  if (!pickerOpen) return null;

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocateError("Your browser cannot share a location.");
      return;
    }
    setLocating(true);
    setLocateError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const match = nearestCity(
          position.coords.latitude,
          position.coords.longitude,
          cities.map((item) => item.name),
        );
        setLocating(false);
        if (match) {
          setCity(match);
        } else {
          setLocateError("We do not have cinemas near you yet.");
        }
      },
      () => {
        setLocating(false);
        setLocateError("Could not read your location. Pick a city below.");
      },
      { timeout: 8000 },
    );
  }

  const term = query.trim().toLowerCase();
  const matches = term
    ? cities.filter((item) => item.name.toLowerCase().includes(term))
    : [];
  const popular = cities.filter((item) => item.is_popular);
  const others = cities.filter((item) => !item.is_popular);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-14"
      onClick={closePicker}
    >
      <div
        className="w-full max-w-[720px] rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 pt-5">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#777]">
              <SearchIcon size={15} />
            </span>
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for your city"
              className="h-11 w-full rounded border border-[#e0e0e0] pl-9 pr-3 text-[14px] text-[#333] outline-none placeholder:text-[#999] focus:border-[#f84464]"
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={detectLocation}
              disabled={locating}
              className="inline-flex items-center gap-1.5 font-medium text-[#f84464] hover:underline disabled:opacity-60"
            >
              <CrosshairIcon />
              {locating ? "Detecting…" : "Detect my location"}
            </button>
            {locateError ? <span className="text-[12px] text-[#888]">{locateError}</span> : null}
          </div>
        </div>

        {term ? (
          <section className="px-6 pb-7 pt-6">
            {matches.length === 0 ? (
              <p className="text-center text-[14px] text-zinc-500">
                No city matches “{query}”.
              </p>
            ) : (
              <CityGrid cities={matches} selected={city} onSelect={setCity} />
            )}
          </section>
        ) : (
          <>
            <section className="px-6 pt-6">
              <p className="text-center text-[13px] text-[#666]">Popular Cities</p>
              <div className="mt-4">
                <CityGrid cities={popular} selected={city} onSelect={setCity} />
              </div>
            </section>

            {showAll && others.length > 0 ? (
              <section className="px-6 pt-7">
                <p className="text-center text-[13px] text-[#666]">Other Cities</p>
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                  {others.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setCity(item.name)}
                      className={`truncate text-left text-[13px] hover:text-[#f84464] ${
                        item.name === city ? "font-medium text-[#f84464]" : "text-[#666]"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {others.length > 0 ? (
              <div className="px-6 pb-6 pt-6 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll((open) => !open)}
                  className="text-[13px] font-medium text-[#f84464] hover:underline"
                >
                  {showAll ? "Hide all cities" : "View All Cities"}
                </button>
              </div>
            ) : (
              <div className="pb-6" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CityGrid({
  cities,
  selected,
  onSelect,
}: {
  cities: City[];
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  if (cities.length === 0) {
    return <p className="text-center text-[14px] text-zinc-500">Loading cities…</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-y-5 sm:grid-cols-5">
      {cities.map((item) => {
        const active = item.name === selected;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(item.name)}
            title={`${item.cinema_count} cinema${item.cinema_count === 1 ? "" : "s"}`}
            className={`group flex flex-col items-center gap-1 px-1 ${
              active ? "text-[#f84464]" : "text-[#666] hover:text-[#f84464]"
            }`}
          >
            <CityIcon city={item.name} />
            <span className="text-[12px] leading-4">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function CrosshairIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
