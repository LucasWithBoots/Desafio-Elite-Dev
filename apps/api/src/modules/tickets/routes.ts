import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest, forbidden, notFound } from "../../shared/http-error.js";
import { requireAuthSession } from "../auth/session.js";
import { toTicketDto } from "./mappers.js";

const ticketParamsSchema = z.object({
  ticketId: z.string().min(1),
});

const shareParamsSchema = z.object({
  shareSlug: z.string().min(1),
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

export async function registerTicketRoutes(server: FastifyInstance) {
  server.get("/tickets/me", async (request) => {
    const session = requireAuthSession(request);

    const tickets = await prisma.ticket.findMany({
      where: { customerId: session.userId },
      include: ticketInclude,
      orderBy: { createdAt: "desc" },
    });

    return tickets.map(toTicketDto);
  });

  server.get("/tickets/:ticketId", async (request) => {
    const session = requireAuthSession(request);
    const parsedParams = ticketParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid ticket id");
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: parsedParams.data.ticketId },
      include: ticketInclude,
    });

    if (!ticket) {
      throw notFound("Ticket not found");
    }

    const canRead =
      ticket.customerId === session.userId ||
      session.role === "GATE" ||
      ticket.event.organizerId === session.userId;

    if (!canRead) {
      throw forbidden();
    }

    return toTicketDto(ticket);
  });

  server.get("/tickets/share/:shareSlug", async (request) => {
    const parsedParams = shareParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid share slug");
    }

    const ticket = await prisma.ticket.findUnique({
      where: { shareSlug: parsedParams.data.shareSlug },
      include: ticketInclude,
    });

    if (!ticket) {
      throw notFound("Ticket not found");
    }

    return toTicketDto(ticket);
  });
}
