import {
  EventStatus,
  ReservationStatus,
  SeatingMode,
} from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest, notFound } from "../../shared/http-error.js";
import { requireAuthSession, requireRoles } from "../auth/session.js";
import { toReservationDto } from "./mappers.js";
import { releaseExpiredReservations } from "./service.js";

const createReservationBodySchema = z.object({
  eventId: z.string().min(1),
  seatId: z.string().optional(),
  quantity: z.coerce.number().int().positive().default(1),
});

export async function registerReservationRoutes(server: FastifyInstance) {
  server.post("/reservations", async (request, reply) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["CUSTOMER"]);

    const parsedBody = createReservationBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw badRequest("Invalid reservation payload");
    }

    const body = parsedBody.data;
    const reservation = await prisma.$transaction(async (transaction) => {
      await releaseExpiredReservations(transaction, body.eventId);

      const event = await transaction.event.findUnique({
        where: { id: body.eventId },
      });

      if (!event) {
        throw notFound("Event not found");
      }

      if (event.status !== EventStatus.PUBLISHED) {
        throw badRequest("Event is not available for reservations");
      }

      const quantity =
        event.seatingMode === SeatingMode.SEAT_MAP ? 1 : body.quantity;

      if (event.seatingMode === SeatingMode.SEAT_MAP) {
        if (!body.seatId) {
          throw badRequest("Seat id is required for this event");
        }

        const seatUpdate = await transaction.seat.updateMany({
          where: {
            id: body.seatId,
            eventId: event.id,
            status: "AVAILABLE",
          },
          data: {
            status: "RESERVED",
          },
        });

        if (seatUpdate.count === 0) {
          throw badRequest("Seat is not available");
        }
      } else {
        const activeReservations = await transaction.reservation.aggregate({
          where: {
            eventId: event.id,
            status: {
              in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
            },
          },
          _sum: {
            quantity: true,
          },
        });
        const reservedQuantity = activeReservations._sum.quantity ?? 0;

        if (event.capacity - reservedQuantity < quantity) {
          throw badRequest("Not enough tickets available");
        }
      }

      return transaction.reservation.create({
        data: {
          eventId: event.id,
          customerId: session.userId,
          seatId: event.seatingMode === SeatingMode.SEAT_MAP ? body.seatId : null,
          quantity,
          status: ReservationStatus.PENDING,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
        include: {
          event: {
            select: {
              priceCents: true,
              currency: true,
            },
          },
        },
      });
    });

    return reply.status(201).send(toReservationDto(reservation));
  });
}
