const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface AuthResponse {
  access_token: string;
  user: { id: string; email: string; nickname: string };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
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
