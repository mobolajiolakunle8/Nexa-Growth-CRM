import { registerWorkspace } from "@/lib/auth/accounts";
import { errorResponse } from "@/lib/auth/errors";
import { applySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = await registerWorkspace({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      displayName: String(body.displayName ?? ""),
      workspaceName: String(body.workspaceName ?? ""),
    });
    return applySession(Response.json({ data: result.user }, { status: 201 }), result.token);
  } catch (error) {
    return errorResponse(error, "We could not create your workspace. Please try again.");
  }
}
