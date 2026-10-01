import { registerWorkspace } from "@/lib/auth/accounts";
import { applySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await registerWorkspace({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      displayName: String(body.displayName ?? ""),
      workspaceName: String(body.workspaceName ?? body.company ?? ""),
    });
    return applySession(
      Response.json({ data: result.user }),
      result.token,
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not create the workspace." },
      { status: 400 },
    );
  }
}
