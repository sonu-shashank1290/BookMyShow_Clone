"use client";

import { formatDayLabel } from "@/common/lib/dates";

export function DateStrip({
  dates,
  selected,
  onSelect,
}: {
  dates: string[];
  selected: string;
  onSelect: (date: string) => void;
}) {
  return (
    <div className="flex gap-0 overflow-x-auto border-b border-zinc-200">
      {dates.map((date) => {
        const label = formatDayLabel(date);
        const active = date === selected;
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            className={`min-w-[78px] px-3 py-2.5 text-center ${
              active ? "bg-[#f84464] text-white" : "bg-white text-[#666] hover:bg-zinc-50"
            }`}
          >
            <div className="text-[11px] font-medium uppercase">{label.weekday}</div>
            <div className={`text-[16px] leading-5 ${active ? "font-bold" : "font-semibold text-[#333]"}`}>
              {label.day}
            </div>
            <div className="text-[11px] uppercase">{label.month}</div>
          </button>
        );
      })}
    </div>
  );
}
