import type { Event, Reservation } from "@prisma/client";

const reservationStatusMap = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

type ReservationWithEvent = Reservation & {
  event: Pick<Event, "priceCents" | "currency">;
};

export function toReservationDto(reservation: ReservationWithEvent) {
  return {
    id: reservation.id,
    eventId: reservation.eventId,
    customerId: reservation.customerId,
    seatId: reservation.seatId ?? undefined,
    quantity: reservation.quantity,
    status: reservationStatusMap[reservation.status],
    amount: (reservation.event.priceCents * reservation.quantity) / 100,
    currency: reservation.event.currency,
    expiresAt: reservation.expiresAt?.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
  };
}
