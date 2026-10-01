import { loginWorkspace } from "@/lib/auth/accounts";
import { applySession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await loginWorkspace({
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
    });
    return applySession(Response.json({ data: result.user }), result.token);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not sign in." },
      { status: 401 },
    );
  }
}
