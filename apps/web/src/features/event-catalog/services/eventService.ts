import type { Event } from "@/entities/event/model";
import type { Seat } from "@/entities/seat/model";
import { httpClient } from "@/shared/api/http-client";

export interface ListEventsFilters {
  search?: string;
  city?: string;
  category?: string;
}

function toQueryString(filters?: ListEventsFilters) {
  const searchParams = new URLSearchParams();

  if (filters?.search) {
    searchParams.set("search", filters.search);
  }

  if (filters?.city) {
    searchParams.set("city", filters.city);
  }

  if (filters?.category && filters.category !== "All") {
    searchParams.set("category", filters.category);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export const eventService = {
  listPublishedEvents(filters?: ListEventsFilters) {
    return httpClient<Event[]>(`/events${toQueryString(filters)}`);
  },

  getEventById(eventId: string) {
    return httpClient<Event>(`/events/${eventId}`);
  },

  listEventSeats(eventId: string) {
    return httpClient<Seat[]>(`/events/${eventId}/seats`);
  },
};
