import type { Event, Seat, Ticket } from "@prisma/client";
import { env } from "../../shared/env.js";

const ticketStatusMap = {
  ACTIVE: "active",
  USED: "used",
  CANCELLED: "cancelled",
} as const;

type TicketWithRelations = Ticket & {
  event?: Pick<Event, "id" | "title" | "startsAt" | "venueName">;
  seat?: Pick<Seat, "id" | "label" | "row" | "number"> | null;
};

export function toTicketDto(ticket: TicketWithRelations) {
  return {
    id: ticket.id,
    eventId: ticket.eventId,
    customerId: ticket.customerId,
    seatId: ticket.seatId ?? undefined,
    code: ticket.qrPayload,
    qrPayload: ticket.qrPayload,
    shareUrl: `${env.WEB_API_URL}/tickets/share/${ticket.shareSlug}`,
    status: ticketStatusMap[ticket.status],
    validatedAt: ticket.validatedAt?.toISOString(),
    createdAt: ticket.createdAt.toISOString(),
    event: ticket.event
      ? {
          id: ticket.event.id,
          title: ticket.event.title,
          startsAt: ticket.event.startsAt.toISOString(),
          venueName: ticket.event.venueName,
        }
      : undefined,
    seat: ticket.seat
      ? {
          id: ticket.seat.id,
          label: ticket.seat.label,
          row: ticket.seat.row,
          number: ticket.seat.number,
        }
      : undefined,
  };
}
