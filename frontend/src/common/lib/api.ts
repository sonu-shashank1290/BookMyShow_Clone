const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.name = "ApiError";
  }
}

function readDetail(data: unknown): string {
  if (typeof data !== "object" || data === null || !("detail" in data)) {
    return "Request failed";
  }
  const detail = (data as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item && "msg" in item
          ? String((item as { msg: string }).msg)
          : JSON.stringify(item),
      )
      .join(", ");
  }
  return "Request failed";
}

type ApiOptions = RequestInit & { token?: string | null };

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, readDetail(data));
  }
  return data as T;
}

export function getApiUrl(): string {
  return API_URL;
}
