import { TicketStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest } from "../../shared/http-error.js";
import { requireAuthSession, requireRoles } from "../auth/session.js";
import { hashTicketPayload } from "../tickets/codes.js";
import { toTicketDto } from "../tickets/mappers.js";

const validateTicketBodySchema = z.object({
  qrPayload: z.string().min(1),
  eventId: z.string().optional(),
});

const ticketInclude = {
  event: {
    select: {
      id: true,
      title: true,
      startsAt: true,
      venueName: true,
      imageUrl: true,
      priceCents: true,
      currency: true,
      organizerId: true,
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

export async function registerGateValidationRoutes(server: FastifyInstance) {
  server.post("/gate/validate", async (request) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["GATE", "ORGANIZER"]);

    const parsedBody = validateTicketBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw badRequest("Invalid gate validation payload");
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        codeHash: hashTicketPayload(parsedBody.data.qrPayload),
      },
      include: ticketInclude,
    });

    if (!ticket) {
      return {
        status: "invalid",
        message: "Ingresso invalido.",
      };
    }

    if (
      session.role === "ORGANIZER" &&
      ticket.event.organizerId !== session.userId
    ) {
      return {
        status: "wrong-event",
        message: "Este ingresso pertence a outro organizador.",
      };
    }

    if (
      parsedBody.data.eventId &&
      parsedBody.data.eventId !== ticket.eventId
    ) {
      return {
        status: "wrong-event",
        message: "Este ingresso nao pertence a este evento.",
        ticket: toTicketDto(ticket),
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          startsAt: ticket.event.startsAt.toISOString(),
          venueName: ticket.event.venueName,
        },
      };
    }

    if (ticket.status === TicketStatus.USED) {
      return {
        status: "already-used",
        message: "Ingresso ja utilizado.",
        ticket: toTicketDto(ticket),
      };
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      return {
        status: "invalid",
        message: "Ingresso cancelado ou indisponivel.",
      };
    }

    const validatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: TicketStatus.USED,
        validatedAt: new Date(),
      },
      include: ticketInclude,
    });

    return {
      status: "valid",
      message: "Ingresso valido. Entrada liberada.",
      ticket: toTicketDto(validatedTicket),
      event: {
        id: validatedTicket.event.id,
        title: validatedTicket.event.title,
        startsAt: validatedTicket.event.startsAt.toISOString(),
        venueName: validatedTicket.event.venueName,
      },
    };
  });
}
