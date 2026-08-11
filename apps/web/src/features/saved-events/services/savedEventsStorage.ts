const SAVED_EVENTS_EVENT = "elite-events:saved-events-change";

function getSavedEventsKey(userId: string) {
  return `elite-events:saved-events:${userId}`;
}

export function getSavedEventIds(userId: string | undefined) {
  if (!userId) {
    return [];
  }

  const storedIds = window.localStorage.getItem(getSavedEventsKey(userId));

  if (!storedIds) {
    return [];
  }

  try {
    return JSON.parse(storedIds) as string[];
  } catch {
    window.localStorage.removeItem(getSavedEventsKey(userId));
    return [];
  }
}

export function toggleSavedEvent(userId: string, eventId: string) {
  const savedIds = getSavedEventIds(userId);
  const nextSavedIds = savedIds.includes(eventId)
    ? savedIds.filter((savedEventId) => savedEventId !== eventId)
    : [...savedIds, eventId];

  window.localStorage.setItem(
    getSavedEventsKey(userId),
    JSON.stringify(nextSavedIds),
  );
  window.dispatchEvent(new Event(SAVED_EVENTS_EVENT));

  return nextSavedIds;
}

export { SAVED_EVENTS_EVENT };
