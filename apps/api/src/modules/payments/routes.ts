import {
  PaymentStatus,
  ReservationStatus,
  SeatStatus,
  TicketStatus,
} from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest, notFound } from "../../shared/http-error.js";
import { requireAuthSession, requireRoles } from "../auth/session.js";
import { releaseExpiredReservations } from "../reservations/service.js";
import {
  createShareSlug,
  createTicketId,
  createTicketPayload,
  hashTicketPayload,
} from "../tickets/codes.js";
import { toTicketDto } from "../tickets/mappers.js";
import { toPaymentDto } from "./mappers.js";

const simulatePaymentBodySchema = z.object({
  reservationId: z.string().min(1),
  approved: z.boolean().default(true),
});

const ticketInclude = {
  event: {
    select: {
      id: true,
      title: true,
      startsAt: true,
      venueName: true,
    },
  },
  seat: {
    select: {
      id: true,
      label: true,
      row: true,
      number: true,
    },
  },
};

export async function registerPaymentRoutes(server: FastifyInstance) {
  server.post("/payments/simulate", async (request) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["CUSTOMER"]);

    const parsedBody = simulatePaymentBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw badRequest("Invalid payment payload");
    }

    const result = await prisma.$transaction(async (transaction) => {
      const reservation = await transaction.reservation.findFirst({
        where: {
          id: parsedBody.data.reservationId,
          customerId: session.userId,
        },
        include: {
          event: true,
          payment: true,
          ticket: {
            include: ticketInclude,
          },
        },
      });

      if (!reservation) {
        throw notFound("Reservation not found");
      }

      await releaseExpiredReservations(transaction, reservation.eventId);

      if (reservation.ticket && reservation.payment) {
        return {
          payment: reservation.payment,
          ticket: reservation.ticket,
        };
      }

      if (
        reservation.status !== ReservationStatus.PENDING ||
        (reservation.expiresAt && reservation.expiresAt < new Date())
      ) {
        throw badRequest("Reservation is no longer payable");
      }

      const amountCents = reservation.event.priceCents * reservation.quantity;

      if (!parsedBody.data.approved) {
        const payment = await transaction.payment.upsert({
          where: { reservationId: reservation.id },
          create: {
            reservationId: reservation.id,
            amountCents,
            currency: reservation.event.currency,
            status: PaymentStatus.DECLINED,
          },
          update: {
            amountCents,
            status: PaymentStatus.DECLINED,
          },
        });

        await transaction.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.CANCELLED },
        });

        if (reservation.seatId) {
          await transaction.seat.updateMany({
            where: {
              id: reservation.seatId,
              status: SeatStatus.RESERVED,
            },
            data: { status: SeatStatus.AVAILABLE },
          });
        }

        return { payment, ticket: null };
      }

      const payment = await transaction.payment.upsert({
        where: { reservationId: reservation.id },
        create: {
          reservationId: reservation.id,
          amountCents,
          currency: reservation.event.currency,
          status: PaymentStatus.APPROVED,
        },
        update: {
          amountCents,
          status: PaymentStatus.APPROVED,
        },
      });

      await transaction.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.CONFIRMED },
      });

      if (reservation.seatId) {
        await transaction.seat.updateMany({
          where: {
            id: reservation.seatId,
            status: SeatStatus.RESERVED,
          },
          data: { status: SeatStatus.SOLD },
        });
      }

      const ticketId = createTicketId();
      const qrPayload = createTicketPayload(
        ticketId,
        reservation.eventId,
        reservation.customerId,
      );
      const ticket = await transaction.ticket.create({
        data: {
          id: ticketId,
          eventId: reservation.eventId,
          customerId: reservation.customerId,
          reservationId: reservation.id,
          seatId: reservation.seatId,
          codeHash: hashTicketPayload(qrPayload),
          qrPayload,
          shareSlug: createShareSlug(ticketId),
          status: TicketStatus.ACTIVE,
        },
        include: ticketInclude,
      });

      return { payment, ticket };
    });

    return {
      payment: toPaymentDto(result.payment),
      ticket: result.ticket ? toTicketDto(result.ticket) : null,
    };
  });
}
