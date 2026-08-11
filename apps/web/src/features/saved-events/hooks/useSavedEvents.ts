import { useEffect, useState } from "react";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import {
  getSavedEventIds,
  SAVED_EVENTS_EVENT,
  toggleSavedEvent,
} from "../services/savedEventsStorage";

export function useSavedEvents() {
  const session = useAuthSession();
  const userId = session?.user.role === "customer" ? session.user.id : undefined;
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() =>
    getSavedEventIds(userId),
  );

  useEffect(() => {
    setSavedEventIds(getSavedEventIds(userId));
  }, [userId]);

  useEffect(() => {
    function syncSavedEvents() {
      setSavedEventIds(getSavedEventIds(userId));
    }

    window.addEventListener("storage", syncSavedEvents);
    window.addEventListener(SAVED_EVENTS_EVENT, syncSavedEvents);

    return () => {
      window.removeEventListener("storage", syncSavedEvents);
      window.removeEventListener(SAVED_EVENTS_EVENT, syncSavedEvents);
    };
  }, [userId]);

  function toggle(eventId: string) {
    if (!userId) {
      return false;
    }

    setSavedEventIds(toggleSavedEvent(userId, eventId));
    return true;
  }

  return {
    canSave: Boolean(userId),
    savedEventIds,
    isSaved: (eventId: string) => savedEventIds.includes(eventId),
    toggleSavedEvent: toggle,
  };
}
