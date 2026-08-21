"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ApiError } from "@/common/lib/api";
import { useAuth } from "@/features/auth/store/auth-context";

type Mode = "login" | "signup";

function nextHref(path: "/login" | "/signup", next: string | null): string {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const { login, signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      if (mode === "signup") {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      router.push(next || "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div className="grid grid-cols-2 rounded-lg bg-[#f5f5f5] p-1 text-sm font-medium">
        <Link
          href={nextHref("/login", next)}
          className={`rounded-md py-2 text-center ${
            mode === "login" ? "bg-white text-[#333] shadow-sm" : "text-[#777]"
          }`}
        >
          Sign in
        </Link>
        <Link
          href={nextHref("/signup", next)}
          className={`rounded-md py-2 text-center ${
            mode === "signup" ? "bg-white text-[#333] shadow-sm" : "text-[#777]"
          }`}
        >
          Sign up
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-zinc-900">
        {mode === "signup" ? "Create account" : "Sign in"}
      </h1>
      {mode === "signup" ? (
        <label className="block text-sm text-zinc-600">
          Name
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-[#f84464]"
          />
        </label>
      ) : null}
      <label className="block text-sm text-zinc-600">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-[#f84464]"
        />
      </label>
      <label className="block text-sm text-zinc-600">
        Password
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-zinc-900 outline-none focus:border-[#f84464]"
        />
      </label>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#f84464] py-2.5 font-medium text-white hover:bg-[#e03858] disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={nextHref("/login", next)} className="font-medium text-[#f84464]">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to BookMyShow?{" "}
            <Link href={nextHref("/signup", next)} className="font-medium text-[#f84464]">
              Create account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
