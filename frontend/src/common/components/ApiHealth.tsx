"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "ok" | "down";

export function ApiHealth() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    fetch(`${apiUrl}/health`)
      .then((res) => (res.ok ? setStatus("ok") : setStatus("down")))
      .catch(() => setStatus("down"));
  }, []);

  if (status === "ok") return null;

  return (
    <p className="text-sm text-red-500">
      {status === "checking" ? "Checking API…" : "API is down. Start the backend."}
    </p>
  );
}
