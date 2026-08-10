import type { FastifyRequest } from "fastify";
import { forbidden, unauthorized } from "../../shared/http-error.js";
import { verifyAuthToken, type AuthTokenPayload } from "./token.js";

export type AuthRole = AuthTokenPayload["role"];

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: AuthRole;
}

export function requireAuthSession(request: FastifyRequest): AuthSession {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    throw unauthorized();
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    throw unauthorized("Invalid or expired token");
  }

  return {
    userId: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  };
}

export function requireRoles(session: AuthSession, roles: AuthRole[]) {
  if (!roles.includes(session.role)) {
    throw forbidden();
  }
}
