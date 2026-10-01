import { authMode } from "@/lib/auth/config";
import { getAuthSecret } from "@/lib/auth/secret";
import { probeFirebase } from "@/lib/firebase/rest";

export const dynamic = "force-dynamic";

/** Reports how authentication is configured. Never returns secret values. */
export async function GET() {
  const mode = authMode();
  const secret = await getAuthSecret().catch(() => null);
  return Response.json({
    mode,
    secretSource: secret?.source ?? "unavailable",
    firebase: mode === "firebase" ? await probeFirebase() : null,
  });
}
