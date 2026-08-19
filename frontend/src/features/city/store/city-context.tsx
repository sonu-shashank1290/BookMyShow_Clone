"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { listCities } from "@/features/city/api/cities";
import type { City } from "@/features/city/types";

const CITY_KEY = "bms_city";
const FALLBACK_CITY = "Bengaluru";

type CityContextValue = {
  /** Null until the stored city has been read on the client. */
  city: string | null;
  cities: City[];
  ready: boolean;
  pickerOpen: boolean;
  setCity: (name: string) => void;
  openPicker: () => void;
  closePicker: () => void;
};

const CityContext = createContext<CityContextValue | null>(null);

export function CityProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [ready, setReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CITY_KEY);
    setCityState(stored || FALLBACK_CITY);
    setReady(true);

    listCities()
      .then((data) => {
        setCities(data.items);
        // A stored city can disappear if the catalogue changes underneath us.
        const known = data.items.some((item) => item.name === stored);
        if (data.items.length && !known) {
          const preferred =
            data.items.find((item) => item.name === FALLBACK_CITY) ?? data.items[0];
          setCityState(preferred.name);
          localStorage.setItem(CITY_KEY, preferred.name);
          if (!stored) setPickerOpen(true);
        }
      })
      .catch(() => setCities([]));
  }, []);

  const setCity = useCallback((name: string) => {
    setCityState(name);
    localStorage.setItem(CITY_KEY, name);
    setPickerOpen(false);
  }, []);

  const openPicker = useCallback(() => setPickerOpen(true), []);
  const closePicker = useCallback(() => setPickerOpen(false), []);

  const value = useMemo(
    () => ({ city, cities, ready, pickerOpen, setCity, openPicker, closePicker }),
    [city, cities, ready, pickerOpen, setCity, openPicker, closePicker],
  );

  return <CityContext.Provider value={value}>{children}</CityContext.Provider>;
}

export function useCity(): CityContextValue {
  const ctx = useContext(CityContext);
  if (!ctx) {
    throw new Error("useCity must be used inside CityProvider");
  }
  return ctx;
}
