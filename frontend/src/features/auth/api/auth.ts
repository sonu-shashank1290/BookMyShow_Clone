import { api } from "@/common/lib/api";
import type { TokenResponse, User } from "@/features/auth/types";

export function signup(body: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return api<TokenResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return api<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function me(token: string) {
  return api<User>("/auth/me", { token });
}
