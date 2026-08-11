import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  eventService,
  type ListEventsFilters,
} from "../services/eventService";

export function useEvents(filters?: ListEventsFilters) {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => eventService.listPublishedEvents(filters),
    placeholderData: keepPreviousData,
  });
}
