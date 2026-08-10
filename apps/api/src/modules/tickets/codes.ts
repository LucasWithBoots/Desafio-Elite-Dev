import { createHmac, randomUUID } from "node:crypto";
import { env } from "../../shared/env.js";

export function createTicketId() {
  return `tck_${randomUUID()}`;
}

export function createTicketPayload(
  ticketId: string,
  eventId: string,
  customerId: string,
) {
  return `ELITE:TICKET:${ticketId}:${eventId}:${customerId}`;
}

export function createShareSlug(ticketId: string) {
  return `${ticketId.replaceAll("_", "-")}-${randomUUID().slice(0, 8)}`;
}

export function hashTicketPayload(payload: string) {
  return createHmac("sha256", env.TICKET_SIGNING_SECRET)
    .update(payload)
    .digest("hex");
}
