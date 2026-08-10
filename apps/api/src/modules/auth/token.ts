import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../shared/env.js";

export interface AuthTokenPayload {
  sub: string;
  name: string;
  email: string;
  role: "ORGANIZER" | "CUSTOMER" | "GATE";
  iat: number;
  exp: number;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", env.AUTH_TOKEN_SECRET)
    .update(value)
    .digest("base64url");
}

export function signAuthToken(
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64Url(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + 60 * 60 * 8,
    }),
  );
  const unsignedToken = `${header}.${body}`;

  return `${unsignedToken}.${sign(unsignedToken)}`;
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  const [header, body, signature] = token.split(".");

  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = sign(`${header}.${body}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  let payload: AuthTokenPayload;

  try {
    payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AuthTokenPayload;
  } catch {
    return null;
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
