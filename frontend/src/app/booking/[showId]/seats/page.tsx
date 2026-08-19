"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";

import { SeatMap } from "@/features/seats/components/SeatMap";

function SeatsPageInner() {
  const params = useParams<{ showId: string }>();
  return <SeatMap showId={params.showId} />;
}

export default function SeatsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-zinc-500">Loading seat map…</p>}>
      <SeatsPageInner />
    </Suspense>
  );
}
