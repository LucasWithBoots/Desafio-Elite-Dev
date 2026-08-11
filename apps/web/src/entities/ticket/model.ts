import type { Event } from "@/entities/event/model";
import type { Seat } from "@/entities/seat/model";

export type TicketStatus = "active" | "used" | "cancelled";

export interface Ticket {
  id: string;
  eventId: string;
  customerId: string;
  seatId?: string;
  code: string;
  qrPayload: string;
  shareUrl?: string;
  status: TicketStatus;
  validatedAt?: string;
  createdAt: string;
}

export interface TicketDetails extends Ticket {
  event: Pick<Event, "id" | "title" | "startsAt" | "venueName">;
  seat?: Pick<Seat, "id" | "label" | "row" | "number">;
}
