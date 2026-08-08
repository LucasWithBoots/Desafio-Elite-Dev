import { mockEvents } from "./mock-events";

export const eventService = {
  async listPublishedEvents() {
    return mockEvents.filter((event) => event.status === "published");
  },

  async getEventById(eventId: string) {
    return mockEvents.find((event) => event.id === eventId) ?? null;
  },
};
