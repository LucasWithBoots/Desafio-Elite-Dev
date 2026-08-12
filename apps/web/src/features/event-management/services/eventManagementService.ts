import type { Event } from "@/entities/event/model";
import { httpClient } from "@/shared/api/http-client";
import type { EventFormValues, ImportTicketmasterEventInput, TicketmasterSearchResponse } from "../types";

export const eventManagementService = {
  listOrganizerEvents() {
    return httpClient<Event[]>("/organizer/events");
  },

  createEvent(values: EventFormValues) {
    return httpClient<Event>("/events", {
      method: "POST",
      body: JSON.stringify(values),
    });
  },

  publishEvent(eventId: string) {
    return httpClient<Event>(`/events/${eventId}/publish`, {
      method: "POST",
    });
  },

  searchTicketmasterEvents(keyword: string) {
    const params = new URLSearchParams({
      keyword,
      countryCode: "US",
      size: "8",
    });

    return httpClient<TicketmasterSearchResponse>(
      `/catalog/ticketmaster/events?${params.toString()}`,
    );
  },

  importTicketmasterEvent(
    ticketmasterId: string,
    input: ImportTicketmasterEventInput,
  ) {
    const encodedTicketmasterId = encodeURIComponent(ticketmasterId);

    return httpClient<{
      event: Event;
      alreadyImported: boolean;
    }>(`/catalog/ticketmaster/events/${encodedTicketmasterId}/import`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
