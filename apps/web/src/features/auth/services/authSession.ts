import type { User } from "@/entities/user/model";

const AUTH_SESSION_KEY = "elite-events:auth-session";
const AUTH_SESSION_EVENT = "elite-events:auth-session-change";

export interface AuthSession {
  token: string;
  user: User;
}

export function getAuthSession(): AuthSession | null {
  const storedSession = window.localStorage.getItem(AUTH_SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function getAuthToken() {
  return getAuthSession()?.token;
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export { AUTH_SESSION_EVENT };
