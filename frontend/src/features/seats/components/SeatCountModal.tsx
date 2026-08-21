"use client";

import { TIER_LABELS, orderedTiers, tierFillStatus, type FillStatus } from "@/features/seats/lib/tiers";
import type { SeatRow } from "@/features/seats/types";

const STATUS_CLASS: Record<FillStatus, string> = {
  AVAILABLE: "text-[#1ea83c]",
  "FAST FILLING": "text-[#f84464]",
  "SOLD OUT": "text-[#9e9e9e]",
};

export function SeatCountModal({
  open,
  count,
  onChange,
  onConfirm,
  priceTiers,
  rows,
}: {
  open: boolean;
  count: number;
  onChange: (count: number) => void;
  onConfirm: () => void;
  priceTiers: Record<string, number>;
  rows: SeatRow[];
}) {
  if (!open) return null;

  const tiers = orderedTiers(priceTiers);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[540px] rounded-lg bg-white px-5 py-6 shadow-2xl sm:px-8">
        <h2 className="text-center text-[20px] font-bold text-[#333]">How many seats?</h2>
        <div className="mx-auto mt-4 flex h-[52px] items-end justify-center text-[#f84464]">
          <SeatIllustration count={count} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`h-10 w-10 rounded-full text-[14px] font-semibold transition-colors ${
                value === count
                  ? "bg-[#f84464] text-white"
                  : "text-[#666] hover:bg-[#f5f5f5]"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div
          className={`mt-7 grid gap-x-3 gap-y-5 border-t border-[#eee] pt-5 ${
            tiers.length <= 2
              ? "grid-cols-2"
              : tiers.length === 3
                ? "grid-cols-3"
                : "grid-cols-2 sm:grid-cols-4"
          }`}
        >
          {tiers.map((tier) => {
            const status = tierFillStatus(rows, tier);
            return (
              <div key={tier} className="min-w-0 text-center">
                <p className="text-[15px] font-semibold text-[#333]">₹{priceTiers[tier]}</p>
                <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#666]">
                  {TIER_LABELS[tier] ?? tier}
                </p>
                <p className={`mt-1 text-[11px] font-semibold uppercase ${STATUS_CLASS[status]}`}>
                  {status}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded bg-[#e6f7ff] px-3 py-2.5 text-center text-[12px] text-[#1677a3]">
          Bookmyshow recommends booking CLASSIC PLUS seats at this cinema at no extra cost!
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 w-full rounded bg-[#f84464] py-3 text-[15px] font-semibold text-white hover:bg-[#e03858]"
        >
          Select Seats
        </button>
      </div>
    </div>
  );
}

function SeatIllustration({ count }: { count: number }) {
  if (count === 1) {
    return (
      <svg width="72" height="48" viewBox="0 0 72 48" fill="none" aria-hidden>
        <circle cx="16" cy="34" r="8" stroke="currentColor" strokeWidth="3" />
        <circle cx="50" cy="34" r="8" stroke="currentColor" strokeWidth="3" />
        <path d="M16 34c8-16 22-22 34 0" stroke="currentColor" strokeWidth="3" />
        <path d="M36 22l8-10h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (count === 2) {
    return (
      <svg width="80" height="48" viewBox="0 0 80 48" fill="none" aria-hidden>
        <circle cx="22" cy="36" r="8" stroke="currentColor" strokeWidth="3" />
        <circle cx="58" cy="36" r="8" stroke="currentColor" strokeWidth="3" />
        <path d="M22 36h36M30 20h22l8 16" stroke="currentColor" strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg width="88" height="48" viewBox="0 0 88 48" fill="none" aria-hidden>
      <rect x="8" y="18" width="56" height="16" rx="4" stroke="currentColor" strokeWidth="3" />
      <circle cx="24" cy="38" r="7" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="38" r="7" stroke="currentColor" strokeWidth="3" />
      <path d="M64 22h12l4 12H64" stroke="currentColor" strokeWidth="3" />
    </svg>
  );
}
