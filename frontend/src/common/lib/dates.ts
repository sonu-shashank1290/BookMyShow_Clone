export function formatYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function nextDays(count: number): string[] {
  const days: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(formatYmd(day));
  }
  return days;
}

export function formatDayLabel(ymd: string): { weekday: string; day: string; month: string } {
  const date = parseYmd(ymd);
  return {
    weekday: date.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
  };
}

export function formatDuration(mins: number): string {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function formatVotes(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M+ Votes`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K+ Votes`;
  }
  return `${count} Votes`;
}

export function formatShowDate(ymd: string, style: "long" | "short" = "long"): string {
  const date = parseYmd(ymd);
  if (style === "short") {
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatRelease(ymd?: string | null): string {
  if (!ymd) return "";
  return parseYmd(ymd).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function rupees(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
