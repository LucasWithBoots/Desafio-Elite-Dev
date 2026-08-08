export type UserRole = "organizer" | "customer" | "gate";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

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

export interface EventCatalogItem {
  externalId: string;
  source: "ticketmaster";
  title: string;
  description?: string;
  imageUrl?: string;
  externalUrl?: string;
  category?: string;
  genre?: string;
  venueName?: string;
  city?: string;
  country?: string;
  startsAt?: string;
  timezone?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
}

export interface CreateEventInput {
  source: ExternalEventSource;
  externalId?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  date: string;
  time: string;
  venueName: string;
  address?: string;
  city?: string;
  capacity: number;
  price: number;
  currency: string;
  seatingMode: SeatingMode;
}

export type SeatStatus = "available" | "selected" | "reserved" | "sold";

export interface Seat {
  id: string;
  eventId: string;
  row: string;
  number: number;
  label: string;
  status: SeatStatus;
}

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "expired";

export interface Reservation {
  id: string;
  eventId: string;
  customerId: string;
  seatId?: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt?: string;
  createdAt: string;
}

export type PaymentStatus = "pending" | "approved" | "declined";

export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

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

export type GateValidationStatus =
  | "valid"
  | "invalid"
  | "already-used"
  | "wrong-event";

export interface GateValidationResult {
  status: GateValidationStatus;
  message: string;
  ticket?: Ticket;
  event?: Pick<Event, "id" | "title" | "startsAt" | "venueName">;
}
