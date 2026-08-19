"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ApiError } from "@/common/lib/api";
import { useAuth } from "@/features/auth/store/auth-context";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
      router.push(searchParams.get("next") || "/");
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
    </form>
  );
}
