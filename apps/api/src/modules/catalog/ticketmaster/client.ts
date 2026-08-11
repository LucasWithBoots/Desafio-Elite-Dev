import { env } from "../../../shared/env.js";
import { HttpError, serviceUnavailable } from "../../../shared/http-error.js";

const ticketmasterBaseUrl = "https://app.ticketmaster.com/discovery/v2";

export type TicketmasterQueryValue =
  | string
  | number
  | boolean
  | string[]
  | undefined;

export type TicketmasterQueryParams = Record<string, TicketmasterQueryValue>;

function appendQueryParam(
  searchParams: URLSearchParams,
  key: string,
  value: TicketmasterQueryValue,
) {
  if (value === undefined || value === "") {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (item) {
        searchParams.append(key, item);
      }
    }
    return;
  }

  searchParams.set(key, String(value));
}

function parseTicketmasterError(status: number, body: string) {
  if (!body) {
    return "Ticketmaster request failed";
  }

  try {
    const parsed = JSON.parse(body) as {
      fault?: {
        faultstring?: string;
      };
      errors?: Array<{ detail?: string; status?: string; code?: string }>;
    };

    return (
      parsed.fault?.faultstring ??
      parsed.errors?.[0]?.detail ??
      parsed.errors?.[0]?.code ??
      `Ticketmaster request failed with status ${status}`
    );
  } catch {
    return `Ticketmaster request failed with status ${status}`;
  }
}

export async function requestTicketmaster<TResponse>(
  path: string,
  params: TicketmasterQueryParams = {},
) {
  if (!env.TICKETMASTER_API_KEY) {
    throw serviceUnavailable("Ticketmaster API key is not configured");
  }

  const url = new URL(`${ticketmasterBaseUrl}${path}`);
  url.searchParams.set("apikey", env.TICKETMASTER_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    if (key !== "apikey") {
      appendQueryParam(url.searchParams, key, value);
    }
  }

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(response.status, parseTicketmasterError(response.status, body));
  }

  return (await response.json()) as TResponse;
}

export function normalizeTicketmasterQuery(
  query: unknown,
): TicketmasterQueryParams {
  if (!query || typeof query !== "object") {
    return {};
  }

  const params: TicketmasterQueryParams = {};

  for (const [key, value] of Object.entries(query)) {
    if (key === "apikey") {
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      Array.isArray(value)
    ) {
      params[key] = value as TicketmasterQueryValue;
    }
  }

  return params;
}
