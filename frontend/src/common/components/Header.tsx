"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/common/components/BrandLogo";
import { DummyLink } from "@/common/components/DummyLink";
import { ChevronDownIcon, MenuIcon, SearchIcon, UserIcon } from "@/common/components/Icons";
import { useAuth } from "@/features/auth/store/auth-context";
import { useCity } from "@/features/city/store/city-context";

const PRIMARY = ["Stream", "Events", "Plays", "Sports", "Activities"];
const UTILITY = ["ListYourShow", "Corporates", "Offers", "Gift Cards"];

export function Header() {
  const { user, ready, logout } = useAuth();
  const { city, openPicker } = useCity();
  const pathname = usePathname();

  if (pathname.startsWith("/booking") || pathname.startsWith("/payment")) {
    return null;
  }

  return (
    <header className="bg-white">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center gap-5 px-6">
        <BrandLogo />
        <div className="relative hidden flex-1 md:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#777]">
            <SearchIcon size={15} />
          </span>
          <input
            type="search"
            placeholder="Search for Movies, Events, Plays, Sports and Activities"
            className="h-10 w-full rounded-md border border-[#e5e5e5] bg-[#f5f5f5] pl-9 pr-3 text-[13px] text-[#333] outline-none placeholder:text-[#999]"
          />
        </div>
        <div className="ml-auto flex items-center gap-4 text-[13px] text-[#333]">
          <button
            type="button"
            onClick={openPicker}
            className="hidden items-center gap-1 hover:text-[#f84464] sm:inline-flex"
          >
            {city ?? "Select city"} <ChevronDownIcon className="text-[#666]" />
          </button>
          {ready && user ? (
            <>
              <Link href="/my-bookings" className="inline-flex items-center gap-1 hover:text-[#f84464]">
                <UserIcon size={16} /> Hi, {user.name}
              </Link>
              <button type="button" onClick={logout} className="text-[#666] hover:text-[#f84464]">
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded bg-[#f84464] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#e03858]"
            >
              Sign in
            </Link>
          )}
          <DummyLink className="text-[#333]">
            <MenuIcon />
          </DummyLink>
        </div>
      </div>
      <div className="border-t border-[#eee] bg-[#f5f5f5] text-[#333]">
        <div className="mx-auto flex h-10 w-full max-w-[1240px] items-center justify-between px-6 text-[13px]">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-medium text-[#333]">
              Movies
            </Link>
            {PRIMARY.map((item) => (
              <DummyLink key={item} className="hidden text-[#333] hover:text-[#f84464] sm:inline">
                {item}
              </DummyLink>
            ))}
          </div>
          <div className="hidden items-center gap-6 text-[12px] text-[#666] md:flex">
            {UTILITY.map((item) => (
              <DummyLink key={item} className="hover:text-[#333]">
                {item}
              </DummyLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
