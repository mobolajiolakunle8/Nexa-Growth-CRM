/**
 * An error that is safe to show to the user. Anything that is NOT an AuthError
 * is treated as an internal failure: it is logged and the user sees a generic
 * message, so database or provider details never leak to the browser.
 */
export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[auth]", error);
  return Response.json({ error: fallback }, { status: 500 });
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
