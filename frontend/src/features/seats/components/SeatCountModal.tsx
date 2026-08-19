"use client";

const TIER_LABELS: Record<string, string> = {
  recliner: "RECLINER ROWS",
  prime: "PRIME ROWS",
  classic: "CLASSIC ROWS",
  classic_plus: "CLASSIC PLUS ROWS",
};

export function SeatCountModal({
  open,
  count,
  onChange,
  onConfirm,
  priceTiers,
}: {
  open: boolean;
  count: number;
  onChange: (count: number) => void;
  onConfirm: () => void;
  priceTiers: Record<string, number>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-center text-xl font-bold text-zinc-900">How many seats?</h2>
        <div className="mx-auto mt-5 flex h-16 items-end justify-center text-[#f84464]">
          <SeatIllustration count={count} />
        </div>
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`h-9 w-9 rounded-full text-sm font-semibold ${
                value === count
                  ? "bg-[#f84464] text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-4 overflow-x-auto text-center text-xs">
          {Object.entries(priceTiers).map(([tier, price]) => (
            <div key={tier} className="min-w-[110px] shrink-0">
              <p className="font-semibold uppercase text-zinc-700">
                {TIER_LABELS[tier] ?? `${tier} rows`}
              </p>
              <p className="mt-1 text-zinc-500">₹{price}</p>
              <p className="text-emerald-600">AVAILABLE</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded bg-sky-50 px-3 py-2 text-center text-xs text-sky-800">
          Book the bestseller seats in this cinema at no extra cost!
        </div>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 w-full rounded-md bg-[#f84464] py-3 text-sm font-semibold text-white hover:bg-[#e03858]"
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
