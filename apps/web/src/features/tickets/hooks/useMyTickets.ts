import { useQuery } from "@tanstack/react-query";
import { ticketService } from "../services/ticketService";

export function useMyTickets() {
  return useQuery({
    queryKey: ["tickets", "me"],
    queryFn: ticketService.listMyTickets,
  });
}
