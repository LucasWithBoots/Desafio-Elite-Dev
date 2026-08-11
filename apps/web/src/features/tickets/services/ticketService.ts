import type { TicketDetails } from "@/entities/ticket/model";
import { httpClient } from "@/shared/api/http-client";

export const ticketService = {
  listMyTickets() {
    return httpClient<TicketDetails[]>("/tickets/me");
  },

  getTicketById(ticketId: string) {
    return httpClient<TicketDetails>(`/tickets/${ticketId}`);
  },

  getSharedTicket(shareSlug: string) {
    return httpClient<TicketDetails>(`/tickets/share/${shareSlug}`);
  },
};
