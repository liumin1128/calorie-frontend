import type { UserFullProfile } from "@/types/user";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface AuthResponse {
  access_token: string;
  user: UserFullProfile;
}

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  token?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function request<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const { token, params, headers: rawHeaders, ...init } = options ?? {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...rawHeaders,
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let url = `${API_BASE}${path}`;
  if (params) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) sp.append(k, String(v));
    }
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `请求失败 (${res.status})`);
  }
  return res.json();
}

export function register(email: string, password: string, nickname?: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, nickname }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getProfile(token: string) {
  return request<{ _id: string; email: string; nickname: string }>(
    "/auth/profile",
    { headers: { Authorization: `Bearer ${token}` } },
  );
}
