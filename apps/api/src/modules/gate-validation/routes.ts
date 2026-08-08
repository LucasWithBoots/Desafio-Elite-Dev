import type { FastifyInstance } from "fastify";

export async function registerGateValidationRoutes(server: FastifyInstance) {
  server.post("/gate/validate", async () => ({
    status: "valid",
    message: "Ingresso valido. Entrada liberada.",
  }));
}
