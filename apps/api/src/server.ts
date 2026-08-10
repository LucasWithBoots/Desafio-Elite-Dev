import { createHttpServer } from "./infra/http/server.js";
import { env } from "./shared/env.js";

const server = await createHttpServer();

try {
  await server.listen({ host: env.API_HOST, port: env.API_PORT });
  server.log.info(`API running at http://${env.API_HOST}:${env.API_PORT}`);
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
