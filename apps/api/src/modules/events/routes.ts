import type { FastifyInstance } from "fastify";

const events = [
  {
    id: "evt_rock-night",
    title: "Rock Night Live",
    startsAt: "2026-09-12T21:00:00.000-03:00",
    venueName: "Arena Centro",
    price: 120,
    currency: "BRL",
    status: "published",
  },
];

export async function registerEventRoutes(server: FastifyInstance) {
  server.get("/events", async () => events);

  server.get("/events/:eventId", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const event = events.find((item) => item.id === eventId);

    if (!event) {
      return reply.status(404).send({ message: "Event not found" });
    }

    return event;
  });
}
