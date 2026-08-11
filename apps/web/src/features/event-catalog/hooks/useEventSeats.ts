import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/eventService";

export function useEventSeats(eventId: string | undefined) {
  return useQuery({
    queryKey: ["events", eventId, "seats"],
    queryFn: () => eventService.listEventSeats(eventId as string),
    enabled: Boolean(eventId),
  });
}
