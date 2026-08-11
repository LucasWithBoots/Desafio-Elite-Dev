import { getAuthToken } from "@/features/auth/services/authSession";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export async function httpClient<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}
