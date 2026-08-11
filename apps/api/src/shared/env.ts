import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const currentDir = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(currentDir, "../../../../.env") });
config({ path: resolve(currentDir, "../../.env"), override: true });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/elite_events?schema=public"),
  API_HOST: z.string().default("0.0.0.0"),
  API_PORT: z.coerce.number().int().positive().default(3333),
  WEB_API_URL: z.string().url().default("http://localhost:3333"),
  AUTH_TOKEN_SECRET: z.string().min(16).default("dev-auth-secret-change-me"),
  TICKET_SIGNING_SECRET: z.string().min(16).default("dev-ticket-secret-change-me"),
  TICKETMASTER_API_KEY: z.string().optional().default(""),
});

export const env = envSchema.parse(process.env);

process.env.DATABASE_URL = env.DATABASE_URL;
