import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";

export function useTicket(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["tickets", ticketId],
    queryFn: () => ticketService.getTicketById(ticketId as string),
    enabled: Boolean(ticketId),
  });
}
