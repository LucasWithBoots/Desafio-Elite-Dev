import { useQuery } from "@tanstack/react-query";
import { eventService } from "../services/eventService";

export function useEvent(eventId: string | undefined) {
  return useQuery({
    queryKey: ["events", eventId],
    queryFn: () => eventService.getEventById(eventId as string),
    enabled: Boolean(eventId),
  });
}
