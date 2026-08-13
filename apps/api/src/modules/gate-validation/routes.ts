import { TicketStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest } from "../../shared/http-error.js";
import { requireAuthSession, requireRoles } from "../auth/session.js";
import {
  hashTicketPayload,
  normalizeManualTicketCode,
  verifyTicketPayload,
} from "../tickets/codes.js";
import { toTicketDto } from "../tickets/mappers.js";

const validateTicketBodySchema = z.object({
  qrPayload: z.string().optional(),
  manualCode: z.string().optional(),
  eventId: z.string().optional(),
}).refine(
  (data) => Boolean(data.qrPayload?.trim() || data.manualCode?.trim()),
  "A ticket code or QR payload is required",
);

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

    const ticketWhere = buildTicketWhere(parsedBody.data);

    if (!ticketWhere) {
      return {
        status: "invalid",
        message: "Ingresso invalido ou assinatura do QR Code incorreta.",
      };
    }

    const ticket = await prisma.ticket.findFirst({
      where: ticketWhere,
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
        message: "Este ingresso ja foi lido na portaria.",
        ticket: toTicketDto(ticket),
      };
    }

    if (ticket.status !== TicketStatus.ACTIVE) {
      return {
        status: "invalid",
        message: "Ingresso cancelado ou indisponivel.",
      };
    }

    const validationTime = new Date();
    const consumedTicket = await prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        status: TicketStatus.ACTIVE,
      },
      data: {
        status: TicketStatus.USED,
        validatedAt: validationTime,
      },
    });

    if (consumedTicket.count === 0) {
      const currentTicket = await prisma.ticket.findUnique({
        where: { id: ticket.id },
        include: ticketInclude,
      });

      if (currentTicket?.status === TicketStatus.USED) {
        return {
          status: "already-used",
          message: "Este ingresso ja foi lido na portaria.",
          ticket: toTicketDto(currentTicket),
        };
      }

      return {
        status: "invalid",
        message: "Ingresso cancelado ou indisponivel.",
      };
    }

    const validatedTicket = await prisma.ticket.findUniqueOrThrow({
      where: { id: ticket.id },
      include: ticketInclude,
    });

    return {
      status: "valid",
      message: "QR Code valido. Entrada liberada.",
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

function buildTicketWhere(
  input: z.infer<typeof validateTicketBodySchema>,
): Prisma.TicketWhereInput | null {
  const conditions: Prisma.TicketWhereInput[] = [];
  const qrPayload = input.qrPayload?.trim();
  const manualCode = input.manualCode?.trim();

  if (qrPayload) {
    const claims = verifyTicketPayload(qrPayload);

    if (claims) {
      conditions.push({
        id: claims.ticketId,
        eventId: claims.eventId,
        customerId: claims.customerId,
        codeHash: hashTicketPayload(qrPayload),
      });
    }

    const shareSlug = extractShareSlug(qrPayload);
    if (shareSlug) {
      conditions.push({ shareSlug });
    }
  }

  if (manualCode) {
    const lowercaseManualCode = manualCode.toLowerCase();

    if (lowercaseManualCode.startsWith("elite:ticket:")) {
      const claims = verifyTicketPayload(manualCode);

      if (claims) {
        conditions.push({
          id: claims.ticketId,
          eventId: claims.eventId,
          customerId: claims.customerId,
          codeHash: hashTicketPayload(manualCode),
        });
      }
    }

    if (lowercaseManualCode.startsWith("tck_")) {
      conditions.push({ id: lowercaseManualCode });
    }

    const normalizedManualCode = normalizeManualTicketCode(manualCode);
    const ticketIdPrefix = normalizedManualCode.startsWith("tck")
      ? normalizedManualCode.slice(3)
      : normalizedManualCode;

    if (ticketIdPrefix) {
      conditions.push({
        id: {
          startsWith: `tck_${ticketIdPrefix}`,
        },
      });
    }
  }

  return conditions.length ? { OR: conditions } : null;
}

function extractShareSlug(value: string) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/tickets\/share\/([^/]+)/);

    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}
