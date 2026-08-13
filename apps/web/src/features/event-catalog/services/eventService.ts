import type { Event, SeatingMode } from "@/entities/event/model";
import type { Seat } from "@/entities/seat/model";
import { httpClient } from "@/shared/api/http-client";

export interface ListEventsFilters {
  search?: string;
  city?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  seatingMode?: SeatingMode;
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

  if (filters?.dateFrom) {
    searchParams.set("dateFrom", filters.dateFrom);
  }

  if (filters?.dateTo) {
    searchParams.set("dateTo", filters.dateTo);
  }

  if (typeof filters?.minPrice === "number") {
    searchParams.set("minPrice", filters.minPrice.toString());
  }

  if (typeof filters?.maxPrice === "number") {
    searchParams.set("maxPrice", filters.maxPrice.toString());
  }

  if (filters?.seatingMode) {
    searchParams.set("seatingMode", filters.seatingMode);
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
