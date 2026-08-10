import cors from "@fastify/cors";
import Fastify from "fastify";
import { registerAuthRoutes } from "../../modules/auth/routes.js";
import { registerEventRoutes } from "../../modules/events/routes.js";
import { registerGateValidationRoutes } from "../../modules/gate-validation/routes.js";
import { registerTicketRoutes } from "../../modules/tickets/routes.js";
import { HttpError } from "../../shared/http-error.js";

export async function createHttpServer() {
  const server = Fastify({
    logger: true,
  });

  await server.register(cors, {
    origin: true,
  });

  server.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({
        message: error.message,
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      message: "Internal server error",
    });
  });

  server.get("/health", async () => ({
    status: "ok",
    service: "elite-events-api",
  }));

  await registerAuthRoutes(server);
  await registerEventRoutes(server);
  await registerTicketRoutes(server);
  await registerGateValidationRoutes(server);

  return server;
}
