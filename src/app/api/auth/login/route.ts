import { loginWorkspace } from "@/lib/auth/accounts";
import { clientIp, errorResponse } from "@/lib/auth/errors";
import { applySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await loginWorkspace({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      ip: clientIp(request),
    });
    return applySession(Response.json({ data: result.user }), result.token);
  } catch (error) {
    return errorResponse(error, "We could not sign you in. Please try again.");
  }
}
