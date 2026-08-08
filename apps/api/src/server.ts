import "dotenv/config";
import { createHttpServer } from "./infra/http/server.js";

const port = Number(process.env.API_PORT ?? 3333);
const host = process.env.API_HOST ?? "0.0.0.0";

const server = await createHttpServer();

try {
  await server.listen({ host, port });
  server.log.info(`API running at http://${host}:${port}`);
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
