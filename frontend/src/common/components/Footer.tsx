"use client";

import { usePathname } from "next/navigation";

import { DummyLink } from "@/common/components/DummyLink";
import { SocialIcon } from "@/common/components/Icons";

const SOCIALS = ["facebook", "x", "instagram", "youtube", "pinterest", "linkedin"] as const;

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/booking") || pathname.startsWith("/payment")) {
    return null;
  }
  return (
    <footer className="mt-auto bg-[#333338] text-white">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-4 px-6 py-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[15px] font-bold text-[#f84464]">
              BMS
            </span>
            <p className="text-[13px] text-zinc-300">
              <span className="font-semibold text-white">List your Show</span>
              {" "}Got a show, event, activity or a great experience? Partner with us
              & get listed on BookMyShow
            </p>
          </div>
          <DummyLink className="rounded bg-[#f84464] px-5 py-2 text-[13px] font-semibold text-white">
            Contact today!
          </DummyLink>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-8 px-6 py-8 text-center text-[11px] tracking-[0.12em] text-zinc-400 sm:grid-cols-3">
        <div>
          <p className="mb-3 flex justify-center text-zinc-300">
            <HeadsetIcon />
          </p>
          24/7 CUSTOMER CARE
        </div>
        <div>
          <p className="mb-3 flex justify-center text-zinc-300">
            <TicketIcon />
          </p>
          RESEND BOOKING CONFIRMATION
        </div>
        <div>
          <p className="mb-3 flex justify-center text-zinc-300">
            <MailIcon />
          </p>
          SUBSCRIBE TO THE NEWSLETTER
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] space-y-4 px-6 pb-8 text-[11px] leading-5 text-zinc-500">
        <div>
          <p className="mb-1 font-semibold uppercase tracking-wider text-zinc-400">
            Movies Now Showing in Bengaluru
          </p>
          <p>
            Vishwanath and Sons | Awarapan 2 | Stree 2 | Jawan | 12th Fail |
            Spider-Man: Across the Spider-Verse | Kalki 2898 AD | Animal |
            Dune: Part Two | Oppenheimer | Pushpa 2: The Rule | Fighter | Interstellar
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bookmyshow-logo.png"
          alt="bookmyshow"
          className="mx-auto h-10 object-contain"
        />
        <div className="mt-5 flex justify-center gap-3">
          {SOCIALS.map((name) => (
            <span
              key={name}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white"
            >
              <SocialIcon name={name} />
            </span>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-zinc-500">
          Copyright 2026 © Bigtree Entertainment Pvt. Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

function HeadsetIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 13a8 8 0 1116 0v5a2 2 0 01-2 2h-2v-7h4M4 13h4v7H6a2 2 0 01-2-2v-5z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 8.5A2.5 2.5 0 016.5 6h11A2.5 2.5 0 0120 8.5v2a2 2 0 100 3v2a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 014 15.5v-2a2 2 0 100-3v-2z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 8l8 6 8-6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
