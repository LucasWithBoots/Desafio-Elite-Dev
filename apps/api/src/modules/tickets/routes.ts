import type { FastifyInstance } from "fastify";

export async function registerTicketRoutes(server: FastifyInstance) {
  server.get("/tickets/me", async () => [
    {
      id: "tck_demo",
      eventId: "evt_rock-night",
      code: "ELITE-TCK-DEMO-2026",
      status: "active",
    },
  ]);
}
