import { clearSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  return clearSession(Response.json({ ok: true }));
}
