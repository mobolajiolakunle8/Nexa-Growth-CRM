import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { requireUser } from "@/lib/firebase/verify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const [profile] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.uid, user.uid));
    return Response.json({ data: { token: user, profile: profile ?? null } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unauthorised" },
      { status: 401 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (typeof body.displayName === "string" && body.displayName.trim()) {
      patch.displayName = body.displayName.trim().slice(0, 180);
    }
    if (typeof body.company === "string") {
      patch.company = body.company.trim().slice(0, 180) || null;
    }
    if (typeof body.phone === "string") {
      patch.phone = body.phone.trim().slice(0, 60) || null;
    }
    if (Object.keys(patch).length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }
    const [updated] = await db
      .update(appUsers)
      .set(patch)
      .where(eq(appUsers.uid, user.uid))
      .returning();
    return Response.json({ data: updated });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unauthorised" },
      { status: 401 },
    );
  }
}
