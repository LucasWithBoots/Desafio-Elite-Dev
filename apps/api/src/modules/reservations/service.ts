import {
  Prisma,
  ReservationStatus,
  SeatStatus,
} from "@prisma/client";

type TransactionClient = Prisma.TransactionClient;

export async function releaseExpiredReservations(
  transaction: TransactionClient,
  eventId?: string,
) {
  const expiredReservations = await transaction.reservation.findMany({
    where: {
      eventId,
      status: ReservationStatus.PENDING,
      expiresAt: {
        lt: new Date(),
      },
    },
    select: {
      id: true,
      seatId: true,
    },
  });

  if (!expiredReservations.length) {
    return;
  }

  await transaction.reservation.updateMany({
    where: {
      id: {
        in: expiredReservations.map((reservation) => reservation.id),
      },
    },
    data: {
      status: ReservationStatus.EXPIRED,
    },
  });

  const expiredSeatIds = expiredReservations
    .map((reservation) => reservation.seatId)
    .filter((seatId): seatId is string => Boolean(seatId));

  if (expiredSeatIds.length) {
    await transaction.seat.updateMany({
      where: {
        id: {
          in: expiredSeatIds,
        },
        status: SeatStatus.RESERVED,
      },
      data: {
        status: SeatStatus.AVAILABLE,
      },
    });
  }
}
