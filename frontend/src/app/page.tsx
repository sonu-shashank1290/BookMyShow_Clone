import { DummyLink } from "@/common/components/DummyLink";
import { MovieGrid } from "@/features/movies/components/MovieGrid";

const LIVE_EVENTS = [
  { title: "Comedy Shows", image: "/events/comedy-shows-collection-202211140440.png" },
  {
    title: "Amusement Parks",
    image: "/events/amusement-parks-banner-desktop-collection-202503251132.png",
  },
  { title: "Theatre Shows", image: "/events/theatre-shows-collection-202211140440.png" },
  { title: "Kids", image: "/events/kids-banner-desktop-collection-202503251132.png" },
  { title: "Adventure & Fun", image: "/events/adventure-fun-collection-202211140440.png" },
];

export default function Home() {
  return (
    <main className="bg-[#f2f5fa]">
      <section className="mx-auto w-full max-w-[1240px] px-6 py-8">
        <div className="mb-5 flex items-end justify-between">
          <h1 className="text-[24px] font-bold text-[#333]">Recommended Movies</h1>
          <DummyLink className="text-[14px] text-[#f84464]">See All ›</DummyLink>
        </div>
        <MovieGrid premiere={false} />
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-6 pb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/stream-banner.png"
          alt="bookmyshow STREAM — Endless Entertainment Anytime. Anywhere!"
          className="h-[92px] w-full rounded-lg object-cover sm:h-[115px]"
        />
      </section>

      <section className="mx-auto w-full max-w-[1240px] px-6 pb-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-[24px] font-bold text-[#333]">The Best Of Live Events</h2>
          <DummyLink className="text-[14px] text-[#f84464]">See All ›</DummyLink>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 sm:gap-6">
          {LIVE_EVENTS.map((event) => (
            <DummyLink
              key={event.title}
              className="block h-[210px] w-[210px] shrink-0 overflow-hidden rounded-xl p-0 sm:h-[224px] sm:w-[224px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </DummyLink>
          ))}
        </div>
      </section>

      <section className="bg-[#2b3148] py-10">
        <div className="mx-auto w-full max-w-[1240px] px-6">
          <p className="text-[14px] font-bold tracking-[0.25em] text-[#f84464]">PREMIERE</p>
          <p className="mt-1 text-[13px] text-zinc-400">Brand new releases every Friday</p>
          <div className="mb-5 mt-5 flex items-end justify-between">
            <h2 className="text-[24px] font-bold text-white">Premieres</h2>
            <DummyLink className="text-[14px] text-[#f84464]">See All ›</DummyLink>
          </div>
          <MovieGrid premiere />
        </div>
      </section>
    </main>
  );
}
