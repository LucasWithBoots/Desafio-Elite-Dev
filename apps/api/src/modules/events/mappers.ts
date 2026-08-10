import { SeatStatus, type Event, type Seat } from "@prisma/client";

const eventStatusMap = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SOLD_OUT: "sold-out",
  CANCELLED: "cancelled",
  FINISHED: "finished",
} as const;

const seatingModeMap = {
  SEAT_MAP: "seat-map",
  GENERAL_ADMISSION: "general-admission",
} as const;

const seatStatusMap = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  SOLD: "sold",
} as const;

type EventWithAvailability = Event & {
  seats?: Pick<Seat, "status">[];
  _count?: {
    tickets: number;
  };
};

export function toEventDto(event: EventWithAvailability) {
  const soldTickets = event._count?.tickets ?? 0;
  const availableSeats = event.seats?.filter(
    (seat) => seat.status === SeatStatus.AVAILABLE,
  ).length;
  const availableTickets =
    event.seatingMode === "SEAT_MAP" && availableSeats !== undefined
      ? availableSeats
      : Math.max(event.capacity - soldTickets, 0);

  return {
    id: event.id,
    title: event.title,
    description: event.description ?? undefined,
    about: event.about ?? undefined,
    imageUrl: event.imageUrl ?? undefined,
    startsAt: event.startsAt.toISOString(),
    venueName: event.venueName,
    address: event.address ?? undefined,
    city: event.city ?? undefined,
    price: event.priceCents / 100,
    currency: event.currency,
    capacity: event.capacity,
    availableTickets,
    seatingMode: seatingModeMap[event.seatingMode],
    status: eventStatusMap[event.status],
    externalSource: event.externalSource ?? undefined,
    externalId: event.externalId ?? undefined,
    category: event.category ?? undefined,
    genre: event.genre ?? undefined,
  };
}

export function toSeatDto(seat: Seat) {
  return {
    id: seat.id,
    eventId: seat.eventId,
    row: seat.row,
    number: seat.number,
    label: seat.label,
    status: seatStatusMap[seat.status],
  };
}
