import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { env } from "../../shared/env.js";

const ticketPayloadPrefix = "ELITE:TICKET:";

export interface TicketPayloadClaims {
  version: 1;
  ticketId: string;
  eventId: string;
  customerId: string;
  issuedAt: number;
}

export function createTicketId() {
  return `tck_${randomUUID()}`;
}

export function createTicketPayload(
  ticketId: string,
  eventId: string,
  customerId: string,
) {
  const claims: TicketPayloadClaims = {
    version: 1,
    ticketId,
    eventId,
    customerId,
    issuedAt: Math.floor(Date.now() / 1000),
  };
  const encodedClaims = Buffer.from(JSON.stringify(claims)).toString("base64url");

  return `${ticketPayloadPrefix}${encodedClaims}.${signTicketValue(encodedClaims)}`;
}

export function verifyTicketPayload(payload: string): TicketPayloadClaims | null {
  const normalizedPayload = payload.trim();

  if (!normalizedPayload.startsWith(ticketPayloadPrefix)) {
    return null;
  }

  const token = normalizedPayload.slice(ticketPayloadPrefix.length);
  const [encodedClaims, signature, extraPart] = token.split(".");

  if (!encodedClaims || !signature || extraPart) {
    return null;
  }

  const expectedSignature = signTicketValue(encodedClaims);
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const claims = JSON.parse(
      Buffer.from(encodedClaims, "base64url").toString("utf8"),
    ) as Partial<TicketPayloadClaims>;

    if (
      claims.version !== 1 ||
      typeof claims.ticketId !== "string" ||
      !claims.ticketId.startsWith("tck_") ||
      typeof claims.eventId !== "string" ||
      !claims.eventId ||
      typeof claims.customerId !== "string" ||
      !claims.customerId ||
      typeof claims.issuedAt !== "number" ||
      !Number.isInteger(claims.issuedAt)
    ) {
      return null;
    }

    return claims as TicketPayloadClaims;
  } catch {
    return null;
  }
}

export function createShareSlug(ticketId: string) {
  return `${ticketId.replaceAll("_", "-")}-${randomUUID().slice(0, 8)}`;
}

export function createManualTicketCode(ticketId: string) {
  return ticketId.replace(/^tck_/, "").slice(0, 8).toUpperCase();
}

export function normalizeManualTicketCode(code: string) {
  return code.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
}

export function hashTicketPayload(payload: string) {
  return createHmac("sha256", env.TICKET_SIGNING_SECRET)
    .update(payload)
    .digest("hex");
}

function signTicketValue(value: string) {
  return createHmac("sha256", env.TICKET_SIGNING_SECRET)
    .update(value)
    .digest("base64url");
}
