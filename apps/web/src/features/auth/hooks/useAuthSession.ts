import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  AUTH_SESSION_EVENT,
  getAuthSession,
  type AuthSession,
} from "../services/authSession";

export function useAuthSession() {
  const location = useLocation();
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  useEffect(() => {
    setSession(getAuthSession());
  }, [location.pathname]);

  useEffect(() => {
    function syncSession() {
      setSession(getAuthSession());
    }

    window.addEventListener("storage", syncSession);
    window.addEventListener(AUTH_SESSION_EVENT, syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener(AUTH_SESSION_EVENT, syncSession);
    };
  }, []);

  return session;
}
