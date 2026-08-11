export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function badRequest(message = "Invalid request") {
  return new HttpError(400, message);
}

export function unauthorized(message = "Authentication required") {
  return new HttpError(401, message);
}

export function forbidden(message = "Access denied") {
  return new HttpError(403, message);
}

export function notFound(message = "Resource not found") {
  return new HttpError(404, message);
}

export function serviceUnavailable(message = "Service unavailable") {
  return new HttpError(503, message);
}
