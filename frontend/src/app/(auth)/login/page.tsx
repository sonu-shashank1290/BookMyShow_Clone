import { Suspense } from "react";

import { AuthForm } from "@/features/auth/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-6 py-16">
      <Suspense fallback={<p className="text-zinc-500">Loading…</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
