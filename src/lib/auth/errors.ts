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

function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) return false;
  if (error.name === "DatabaseNotConfiguredError") return true;
  const code = (error as { code?: string }).code ?? "";
  // connection refused / DNS failure / timeout / auth failure / too many clients
  return ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "28P01", "53300", "57P03"].includes(code);
}

export function errorResponse(error: unknown, fallback: string) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("[auth]", error);
  if (isDatabaseUnavailable(error)) {
    // Operators see the real cause in the logs and on /api/deploy/status;
    // visitors get a clear, non-technical message.
    return Response.json(
      { error: "Sign-in is temporarily unavailable. Please try again in a few minutes." },
      { status: 503 },
    );
  }
  return Response.json({ error: fallback }, { status: 500 });
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
