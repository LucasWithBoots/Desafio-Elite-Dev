import type { TicketDetails } from "@/entities/ticket/model";

export interface ShareTicketLink {
  ticketId: TicketDetails["id"];
  url: string;
  expiresAt?: string;
}
