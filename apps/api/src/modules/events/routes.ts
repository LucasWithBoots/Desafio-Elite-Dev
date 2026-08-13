import {
  EventStatus,
  Prisma,
  SeatStatus,
  SeatingMode,
  type Seat,
} from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest, notFound } from "../../shared/http-error.js";
import { requireAuthSession, requireRoles } from "../auth/session.js";
import { toEventDto, toSeatDto } from "./mappers.js";

const listEventsQuerySchema = z
  .object({
    search: z.string().optional(),
    city: z.string().optional(),
    category: z.string().optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    seatingMode: z.enum(["seat-map", "general-admission"]).optional(),
    status: z
      .enum(["draft", "published", "sold-out", "cancelled", "finished"])
      .optional(),
  })
  .refine(
    ({ dateFrom, dateTo }) => !dateFrom || !dateTo || dateFrom <= dateTo,
    { message: "dateFrom must be before dateTo" },
  )
  .refine(
    ({ minPrice, maxPrice }) =>
      minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
    { message: "minPrice must not exceed maxPrice" },
  );

const createEventBodySchema = z.object({
  source: z.enum(["manual", "ticketmaster"]).default("manual"),
  externalId: z.string().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  about: z.string().optional(),
  imageUrl: z.string().url().optional(),
  date: z.string().min(8),
  time: z.string().min(4),
  venueName: z.string().min(2),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative(),
  currency: z.string().min(3).default("BRL"),
  seatingMode: z.enum(["seat-map", "general-admission"]).default("seat-map"),
  category: z.string().optional(),
  genre: z.string().optional(),
});

const paramsSchema = z.object({
  eventId: z.string().min(1),
});

const eventInclude = {
  seats: {
    select: {
      status: true,
    },
  },
  _count: {
    select: {
      tickets: true,
    },
  },
} satisfies Prisma.EventInclude;

const statusMap = {
  draft: EventStatus.DRAFT,
  published: EventStatus.PUBLISHED,
  "sold-out": EventStatus.SOLD_OUT,
  cancelled: EventStatus.CANCELLED,
  finished: EventStatus.FINISHED,
} as const;

const seatingModeMap = {
  "seat-map": SeatingMode.SEAT_MAP,
  "general-admission": SeatingMode.GENERAL_ADMISSION,
} as const;

function toCents(value: number) {
  return Math.round(value * 100);
}

function getStartsAt(date: string, time: string) {
  const timeWithSeconds = time.length === 5 ? `${time}:00` : time;
  const startsAt = new Date(`${date}T${timeWithSeconds}`);

  if (Number.isNaN(startsAt.getTime())) {
    throw badRequest("Invalid event date or time");
  }

  return startsAt;
}

function makeSeatId(eventId: string, row: string, number: number) {
  return `seat_${eventId}_${row}_${number}`;
}

function makeSeats(eventId: string, capacity: number): Prisma.SeatCreateManyInput[] {
  const rows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const seatsPerRow = 10;

  return Array.from({ length: capacity }, (_, index) => {
    const row = rows[Math.floor(index / seatsPerRow)] ?? `R${index}`;
    const number = (index % seatsPerRow) + 1;

    return {
      id: makeSeatId(eventId, row, number),
      eventId,
      row,
      number,
      label: `${row}${number}`,
      status: SeatStatus.AVAILABLE,
    };
  });
}

function buildSearchWhere(
  query: z.infer<typeof listEventsQuerySchema>,
): Prisma.EventWhereInput {
  const where: Prisma.EventWhereInput = {
    status: query.status ? statusMap[query.status] : EventStatus.PUBLISHED,
  };

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
      { venueName: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.city) {
    where.city = { contains: query.city, mode: "insensitive" };
  }

  if (query.category) {
    where.category = { equals: query.category, mode: "insensitive" };
  }

  if (query.dateFrom || query.dateTo) {
    where.startsAt = {
      ...(query.dateFrom ? { gte: query.dateFrom } : {}),
      ...(query.dateTo ? { lte: query.dateTo } : {}),
    };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.priceCents = {
      ...(query.minPrice !== undefined ? { gte: toCents(query.minPrice) } : {}),
      ...(query.maxPrice !== undefined ? { lte: toCents(query.maxPrice) } : {}),
    };
  }

  if (query.seatingMode) {
    where.seatingMode = seatingModeMap[query.seatingMode];
  }

  return where;
}

export async function registerEventRoutes(server: FastifyInstance) {
  server.get("/organizer/events", async (request) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["ORGANIZER"]);

    const events = await prisma.event.findMany({
      where: { organizerId: session.userId },
      include: eventInclude,
      orderBy: { startsAt: "asc" },
    });

    return events.map(toEventDto);
  });

  server.get("/events", async (request) => {
    const parsedQuery = listEventsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw badRequest("Invalid event filters");
    }

    const events = await prisma.event.findMany({
      where: buildSearchWhere(parsedQuery.data),
      include: eventInclude,
      orderBy: { startsAt: "asc" },
    });

    return events.map(toEventDto);
  });

  server.get("/events/:eventId", async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid event id");
    }

    const event = await prisma.event.findUnique({
      where: { id: parsedParams.data.eventId },
      include: eventInclude,
    });

    if (!event) {
      throw notFound("Event not found");
    }

    return toEventDto(event);
  });

  server.get("/events/:eventId/seats", async (request) => {
    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid event id");
    }

    const event = await prisma.event.findUnique({
      where: { id: parsedParams.data.eventId },
      select: { id: true, seatingMode: true },
    });

    if (!event) {
      throw notFound("Event not found");
    }

    if (event.seatingMode === SeatingMode.GENERAL_ADMISSION) {
      return [];
    }

    const seats = await prisma.seat.findMany({
      where: { eventId: event.id },
      orderBy: [{ row: "asc" }, { number: "asc" }],
    });

    return seats.map((seat: Seat) => toSeatDto(seat));
  });

  server.post("/events", async (request, reply) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["ORGANIZER"]);

    const parsedBody = createEventBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw badRequest("Invalid event payload");
    }

    const body = parsedBody.data;
    const createdEvent = await prisma.$transaction(async (transaction) => {
      const event = await transaction.event.create({
        data: {
          organizerId: session.userId,
          title: body.title,
          description: body.description,
          about: body.about,
          imageUrl: body.imageUrl,
          startsAt: getStartsAt(body.date, body.time),
          venueName: body.venueName,
          address: body.address,
          city: body.city,
          priceCents: toCents(body.price),
          currency: body.currency,
          capacity: body.capacity,
          seatingMode: seatingModeMap[body.seatingMode],
          status: EventStatus.DRAFT,
          externalSource: body.source,
          externalId: body.externalId,
          category: body.category,
          genre: body.genre,
        },
      });

      if (event.seatingMode === SeatingMode.SEAT_MAP) {
        await transaction.seat.createMany({
          data: makeSeats(event.id, event.capacity),
        });
      }

      return transaction.event.findUniqueOrThrow({
        where: { id: event.id },
        include: eventInclude,
      });
    });

    return reply.status(201).send(toEventDto(createdEvent));
  });

  server.patch("/events/:eventId", async (request) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["ORGANIZER"]);

    const parsedParams = paramsSchema.safeParse(request.params);
    const parsedBody = createEventBodySchema.safeParse(request.body);

    if (!parsedParams.success) {
      throw badRequest("Invalid event id");
    }

    if (!parsedBody.success) {
      throw badRequest("Invalid event payload");
    }

    const body = parsedBody.data;
    const updatedEvent = await prisma.$transaction(async (transaction) => {
      const event = await transaction.event.findFirst({
        where: {
          id: parsedParams.data.eventId,
          organizerId: session.userId,
        },
      });

      if (!event) {
        throw notFound("Event not found");
      }

      if (event.status !== EventStatus.DRAFT) {
        throw badRequest("Only draft events can be edited");
      }

      await transaction.seat.deleteMany({
        where: { eventId: event.id },
      });

      const updated = await transaction.event.update({
        where: { id: event.id },
        data: {
          title: body.title,
          description: body.description,
          about: body.about,
          imageUrl: body.imageUrl,
          startsAt: getStartsAt(body.date, body.time),
          venueName: body.venueName,
          address: body.address,
          city: body.city,
          priceCents: toCents(body.price),
          currency: body.currency,
          capacity: body.capacity,
          seatingMode: seatingModeMap[body.seatingMode],
          externalSource: body.source,
          externalId: body.externalId,
          category: body.category,
          genre: body.genre,
        },
      });

      if (updated.seatingMode === SeatingMode.SEAT_MAP) {
        await transaction.seat.createMany({
          data: makeSeats(updated.id, updated.capacity),
        });
      }

      return transaction.event.findUniqueOrThrow({
        where: { id: updated.id },
        include: eventInclude,
      });
    });

    return toEventDto(updatedEvent);
  });

  server.post("/events/:eventId/publish", async (request) => {
    const session = requireAuthSession(request);
    requireRoles(session, ["ORGANIZER"]);

    const parsedParams = paramsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid event id");
    }

    const event = await prisma.event.findFirst({
      where: {
        id: parsedParams.data.eventId,
        organizerId: session.userId,
      },
    });

    if (!event) {
      throw notFound("Event not found");
    }

    const publishedEvent = await prisma.event.update({
      where: { id: event.id },
      data: { status: EventStatus.PUBLISHED },
      include: eventInclude,
    });

    return toEventDto(publishedEvent);
  });
}
