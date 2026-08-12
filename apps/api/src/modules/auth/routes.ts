import { Prisma, UserRole } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../../infra/db/prisma.js";
import { badRequest, unauthorized } from "../../shared/http-error.js";
import { toUserDto } from "./mappers.js";
import { hashPassword, verifyPassword } from "./password.js";
import { requireAuthSession } from "./session.js";
import { signAuthToken } from "./token.js";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerBodySchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerAuthRoutes(server: FastifyInstance) {
  server.post("/auth/login", async (request, reply) => {
    const parsedBody = loginBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw badRequest("Invalid login payload");
    }

    const user = await prisma.user.findUnique({
      where: { email: parsedBody.data.email.toLowerCase() },
    });

    if (!user || !verifyPassword(parsedBody.data.password, user.passwordHash)) {
      throw unauthorized("Invalid email or password");
    }

    const token = signAuthToken({
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return reply.send({
      token,
      user: toUserDto(user),
    });
  });

  server.post("/auth/register", async (request, reply) => {
    const parsedBody = registerBodySchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw badRequest("Invalid register payload");
    }

    const email = parsedBody.data.email.toLowerCase();

    try {
      const user = await prisma.user.create({
        data: {
          name: parsedBody.data.name,
          email,
          passwordHash: hashPassword(parsedBody.data.password),
          role: UserRole.CUSTOMER,
        },
      });

      const token = signAuthToken({
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });

      return reply.code(201).send({
        token,
        user: toUserDto(user),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw badRequest("Email already registered");
      }

      throw error;
    }
  });

  server.get("/auth/me", async (request) => {
    const session = requireAuthSession(request);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw unauthorized("User no longer exists");
    }

    return toUserDto(user);
  });

  server.get("/auth/demo-users", async () => {
    const users = await prisma.user.findMany({
      orderBy: { role: "asc" },
    });

    return users.map((user) => ({
      ...toUserDto(user),
      demoPassword: "123456",
    }));
  });
}
