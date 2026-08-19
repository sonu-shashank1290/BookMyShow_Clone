"use client";

import { QRCodeSVG } from "qrcode.react";

import { BrandLogo } from "@/common/components/BrandLogo";
import { formatShowDate, formatTime12, rupees } from "@/common/lib/dates";
import type { Booking } from "@/features/booking/types";

export function MTicket({ booking, holder }: { booking: Booking; holder?: string }) {
  const payload = JSON.stringify({
    v: 1,
    code: booking.ticket_code,
    booking_id: booking.id,
    show_id: booking.show_id,
    seats: booking.seats,
  });
  const langFmt = [booking.language, booking.format].filter(Boolean).join(" • ");

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-md">
      <header className="flex items-center justify-between bg-[#1f2533] px-5 py-3">
        <BrandLogo href={null} size="sm" invert />
        <span className="rounded bg-[#f84464] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          M-Ticket
        </span>
      </header>

      <div className="px-5 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#f84464]">
          {booking.status === "confirmed" ? "Booking confirmed" : booking.status}
        </p>
        <h1 className="mt-1 text-[22px] font-bold leading-tight text-[#222]">
          {booking.movie_title ?? "Movie"}
        </h1>
        <p className="mt-1 text-[13px] text-[#666]">
          {[booking.movie_rating, langFmt].filter(Boolean).join("  ·  ")}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-y border-dashed border-zinc-200 px-5 py-4 text-center">
        <TicketField
          label="Date"
          value={booking.show_date ? formatShowDate(booking.show_date, "short") : "—"}
        />
        <TicketField
          label="Time"
          value={booking.start_time ? formatTime12(booking.start_time) : "—"}
        />
        <TicketField label="Seats" value={booking.seats.join(", ") || "—"} />
      </div>

      <div className="flex items-start gap-4 px-5 py-5">
        <div className="min-w-0 flex-1 text-left">
          <TicketField label="Cinema" value={booking.cinema_name ?? "—"} align="left" />
          {booking.screen_name ? (
            <p className="mt-0.5 text-[13px] text-[#666]">{booking.screen_name}</p>
          ) : null}
          {booking.cinema_address ? (
            <p className="mt-0.5 text-[12px] text-[#888]">{booking.cinema_address}</p>
          ) : null}
          {holder ? (
            <TicketField label="Booked by" value={holder} align="left" className="mt-3" />
          ) : null}
          <TicketField
            label="Amount paid"
            value={`₹${rupees(booking.amount)}`}
            align="left"
            className="mt-3"
          />
        </div>
        <div className="shrink-0 rounded-md border border-zinc-200 bg-white p-2">
          <QRCodeSVG value={payload} size={132} level="M" />
        </div>
      </div>

      <footer className="flex items-center justify-between bg-[#f7f7f7] px-5 py-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#888]">Booking ID</p>
          <p className="font-mono text-[15px] font-semibold tracking-wide text-[#222]">
            {booking.ticket_code ?? booking.id.slice(-8).toUpperCase()}
          </p>
        </div>
        <p className="max-w-[140px] text-right text-[11px] leading-4 text-[#888]">
          Show this QR at the cinema entrance
        </p>
      </footer>
    </article>
  );
}

function TicketField({
  label,
  value,
  align = "center",
  className = "",
}: {
  label: string;
  value: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={`${align === "left" ? "text-left" : "text-center"} ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-[#888]">{label}</p>
      <p className="mt-0.5 text-[14px] font-semibold text-[#222]">{value}</p>
    </div>
  );
}
