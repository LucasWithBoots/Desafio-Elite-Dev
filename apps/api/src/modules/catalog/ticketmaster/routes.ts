import {
  EventStatus,
  Prisma,
  SeatStatus,
  SeatingMode,
} from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../../infra/db/prisma.js";
import { badRequest } from "../../../shared/http-error.js";
import { requireAuthSession, requireRoles } from "../../auth/session.js";
import { toEventDto } from "../../events/mappers.js";
import {
  normalizeTicketmasterQuery,
  requestTicketmaster,
  type TicketmasterQueryParams,
} from "./client.js";
import { toTicketmasterCatalogItem } from "./mappers.js";
import type {
  TicketmasterAttraction,
  TicketmasterClassificationResponse,
  TicketmasterCollectionResponse,
  TicketmasterEvent,
  TicketmasterEventImagesResponse,
  TicketmasterSuggestResponse,
  TicketmasterVenue,
} from "./types.js";

const ticketmasterIdParamsSchema = z.object({
  ticketmasterId: z.string().min(1),
});

const importTicketmasterEventBodySchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  about: z.string().optional(),
  imageUrl: z.string().url().optional(),
  date: z.string().min(8).optional(),
  time: z.string().min(4).optional(),
  venueName: z.string().min(2).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  capacity: z.coerce.number().int().positive().default(100),
  price: z.coerce.number().nonnegative().optional(),
  currency: z.string().min(3).optional(),
  seatingMode: z.enum(["seat-map", "general-admission"]).default("seat-map"),
  category: z.string().optional(),
  genre: z.string().optional(),
  publish: z.boolean().default(false),
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

const seatingModeMap = {
  "seat-map": SeatingMode.SEAT_MAP,
  "general-admission": SeatingMode.GENERAL_ADMISSION,
} as const;

function withDefaults(query: unknown): TicketmasterQueryParams {
  return {
    locale: "*",
    size: 20,
    sort: "date,asc",
    ...normalizeTicketmasterQuery(query),
  };
}

function toCents(value: number) {
  return Math.round(value * 100);
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

function getStartsAt(
  sourceEvent: TicketmasterEvent,
  dateOverride?: string,
  timeOverride?: string,
) {
  const localDate = dateOverride ?? sourceEvent.dates?.start?.localDate;
  const localTime = timeOverride ?? sourceEvent.dates?.start?.localTime;

  if (localDate) {
    const startsAt = new Date(`${localDate}T${localTime ?? "00:00:00"}`);

    if (!Number.isNaN(startsAt.getTime())) {
      return startsAt;
    }
  }

  if (sourceEvent.dates?.start?.dateTime) {
    const startsAt = new Date(sourceEvent.dates.start.dateTime);

    if (!Number.isNaN(startsAt.getTime())) {
      return startsAt;
    }
  }

  throw badRequest("Ticketmaster event does not have a valid start date");
}

function getCollectionItems<TItem>(
  response: TicketmasterCollectionResponse<TItem>,
  key: string,
) {
  return response._embedded?.[key] ?? [];
}

export async function registerTicketmasterCatalogRoutes(server: FastifyInstance) {
  server.get("/catalog/ticketmaster/events", async (request) => {
    const response = await requestTicketmaster<
      TicketmasterCollectionResponse<TicketmasterEvent>
    >("/events.json", withDefaults(request.query));
    const events = getCollectionItems(response, "events");

    return {
      items: events.map(toTicketmasterCatalogItem),
      page: response.page,
      links: response._links,
    };
  });

  server.get("/catalog/ticketmaster/events/:ticketmasterId", async (request) => {
    const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid Ticketmaster event id");
    }

    const source = await requestTicketmaster<TicketmasterEvent>(
      `/events/${parsedParams.data.ticketmasterId}.json`,
      normalizeTicketmasterQuery(request.query),
    );

    return {
      item: toTicketmasterCatalogItem(source),
      source,
    };
  });

  server.get("/catalog/ticketmaster/events/:ticketmasterId/images", async (request) => {
    const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid Ticketmaster event id");
    }

    return requestTicketmaster<TicketmasterEventImagesResponse>(
      `/events/${parsedParams.data.ticketmasterId}/images.json`,
      normalizeTicketmasterQuery(request.query),
    );
  });

  server.post(
    "/catalog/ticketmaster/events/:ticketmasterId/import",
    async (request, reply) => {
      const session = requireAuthSession(request);
      requireRoles(session, ["ORGANIZER"]);

      const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);
      const parsedBody = importTicketmasterEventBodySchema.safeParse(request.body);

      if (!parsedParams.success) {
        throw badRequest("Invalid Ticketmaster event id");
      }

      if (!parsedBody.success) {
        throw badRequest("Invalid import payload");
      }

      const source = await requestTicketmaster<TicketmasterEvent>(
        `/events/${parsedParams.data.ticketmasterId}.json`,
      );
      const sourceItem = toTicketmasterCatalogItem(source);
      const body = parsedBody.data;

      const importedEvent = await prisma.$transaction(async (transaction) => {
        const existingEvent = await transaction.event.findFirst({
          where: {
            organizerId: session.userId,
            externalSource: "ticketmaster",
            externalId: source.id,
          },
          include: eventInclude,
        });

        if (existingEvent) {
          return {
            event: existingEvent,
            alreadyImported: true,
          };
        }

        const event = await transaction.event.create({
          data: {
            organizerId: session.userId,
            title: body.title ?? sourceItem.title,
            description: body.description ?? sourceItem.description,
            about: body.about ?? sourceItem.description,
            imageUrl: body.imageUrl ?? sourceItem.imageUrl,
            startsAt: getStartsAt(source, body.date, body.time),
            venueName: body.venueName ?? sourceItem.venueName ?? "Local a definir",
            address: body.address ?? sourceItem.address,
            city: body.city ?? sourceItem.city,
            priceCents: toCents(body.price ?? sourceItem.minPrice ?? 0),
            currency: body.currency ?? sourceItem.currency ?? "BRL",
            capacity: body.capacity,
            seatingMode: seatingModeMap[body.seatingMode],
            status: body.publish ? EventStatus.PUBLISHED : EventStatus.DRAFT,
            externalSource: "ticketmaster",
            externalId: source.id,
            category: body.category ?? sourceItem.category,
            genre: body.genre ?? sourceItem.genre,
          },
        });

        if (event.seatingMode === SeatingMode.SEAT_MAP) {
          await transaction.seat.createMany({
            data: makeSeats(event.id, event.capacity),
          });
        }

        const eventWithAvailability = await transaction.event.findUniqueOrThrow({
          where: { id: event.id },
          include: eventInclude,
        });

        return {
          event: eventWithAvailability,
          alreadyImported: false,
        };
      });

      return reply.status(importedEvent.alreadyImported ? 200 : 201).send({
        event: toEventDto(importedEvent.event),
        alreadyImported: importedEvent.alreadyImported,
        source: sourceItem,
      });
    },
  );

  server.get("/catalog/ticketmaster/attractions", async (request) => {
    return requestTicketmaster<TicketmasterCollectionResponse<TicketmasterAttraction>>(
      "/attractions.json",
      withDefaults(request.query),
    );
  });

  server.get("/catalog/ticketmaster/attractions/:ticketmasterId", async (request) => {
    const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid Ticketmaster attraction id");
    }

    return requestTicketmaster<TicketmasterAttraction>(
      `/attractions/${parsedParams.data.ticketmasterId}.json`,
      normalizeTicketmasterQuery(request.query),
    );
  });

  server.get("/catalog/ticketmaster/venues", async (request) => {
    return requestTicketmaster<TicketmasterCollectionResponse<TicketmasterVenue>>(
      "/venues.json",
      withDefaults(request.query),
    );
  });

  server.get("/catalog/ticketmaster/venues/:ticketmasterId", async (request) => {
    const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid Ticketmaster venue id");
    }

    return requestTicketmaster<TicketmasterVenue>(
      `/venues/${parsedParams.data.ticketmasterId}.json`,
      normalizeTicketmasterQuery(request.query),
    );
  });

  server.get("/catalog/ticketmaster/classifications", async (request) => {
    return requestTicketmaster<
      TicketmasterCollectionResponse<TicketmasterClassificationResponse>
    >("/classifications.json", withDefaults(request.query));
  });

  server.get(
    "/catalog/ticketmaster/classifications/genres/:ticketmasterId",
    async (request) => {
      const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        throw badRequest("Invalid Ticketmaster genre id");
      }

      return requestTicketmaster<TicketmasterClassificationResponse>(
        `/classifications/genres/${parsedParams.data.ticketmasterId}.json`,
        normalizeTicketmasterQuery(request.query),
      );
    },
  );

  server.get(
    "/catalog/ticketmaster/classifications/segments/:ticketmasterId",
    async (request) => {
      const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        throw badRequest("Invalid Ticketmaster segment id");
      }

      return requestTicketmaster<TicketmasterClassificationResponse>(
        `/classifications/segments/${parsedParams.data.ticketmasterId}.json`,
        normalizeTicketmasterQuery(request.query),
      );
    },
  );

  server.get(
    "/catalog/ticketmaster/classifications/subgenres/:ticketmasterId",
    async (request) => {
      const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        throw badRequest("Invalid Ticketmaster sub-genre id");
      }

      return requestTicketmaster<TicketmasterClassificationResponse>(
        `/classifications/subgenres/${parsedParams.data.ticketmasterId}.json`,
        normalizeTicketmasterQuery(request.query),
      );
    },
  );

  server.get("/catalog/ticketmaster/classifications/:ticketmasterId", async (request) => {
    const parsedParams = ticketmasterIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw badRequest("Invalid Ticketmaster classification id");
    }

    return requestTicketmaster<TicketmasterClassificationResponse>(
      `/classifications/${parsedParams.data.ticketmasterId}.json`,
      normalizeTicketmasterQuery(request.query),
    );
  });

  server.get("/catalog/ticketmaster/suggest", async (request) => {
    return requestTicketmaster<TicketmasterSuggestResponse>(
      "/suggest.json",
      withDefaults(request.query),
    );
  });
}
