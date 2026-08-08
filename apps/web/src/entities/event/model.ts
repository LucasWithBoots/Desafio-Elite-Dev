export type ExternalEventSource = "ticketmaster" | "manual";

export type EventStatus =
  | "draft"
  | "published"
  | "sold-out"
  | "cancelled"
  | "finished";

export type SeatingMode = "seat-map" | "general-admission";

export interface Event {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  startsAt: string;
  venueName: string;
  address?: string;
  city?: string;
  price: number;
  currency: string;
  capacity: number;
  availableTickets: number;
  seatingMode: SeatingMode;
  status: EventStatus;
  externalSource?: ExternalEventSource;
  externalId?: string;
}
