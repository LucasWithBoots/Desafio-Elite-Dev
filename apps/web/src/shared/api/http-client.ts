import { clearAuthSession, getAuthToken } from "@/features/auth/services/authSession";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function httpClient<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const token = getAuthToken();
  const hasBody = init?.body !== undefined && init.body !== null;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    const message = body?.message ?? `Request failed with status ${response.status}`;

    if (token && (response.status === 401 || response.status === 403)) {
      clearAuthSession();
    }

    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<TResponse>;
}
