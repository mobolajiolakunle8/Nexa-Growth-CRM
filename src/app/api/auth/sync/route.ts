import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { requireUser } from "@/lib/firebase/verify";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = (await request.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    const displayName =
      user.name ??
      (typeof body.displayName === "string" && body.displayName.trim()
        ? body.displayName.trim()
        : null) ??
      (user.email ? user.email.split("@")[0] : null);

    const company =
      typeof body.company === "string" && body.company.trim()
        ? body.company.trim().slice(0, 180)
        : null;
    const phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim().slice(0, 60)
        : null;
    const plan =
      typeof body.plan === "string" && body.plan.trim()
        ? body.plan.trim().slice(0, 40)
        : "professional";

    const [existing] = await db
      .select()
      .from(appUsers)
      .where(eq(appUsers.uid, user.uid));

    if (existing) {
      const [updated] = await db
        .update(appUsers)
        .set({
          email: user.email ?? existing.email,
          displayName: displayName ?? existing.displayName,
          photoUrl: user.picture ?? existing.photoUrl,
          provider: user.provider,
          emailVerified: user.emailVerified,
          company: company ?? existing.company,
          phone: phone ?? existing.phone,
          lastLoginAt: new Date(),
        })
        .where(eq(appUsers.uid, user.uid))
        .returning();
      return Response.json({ data: updated, created: false });
    }

    const count = await db.select({ id: appUsers.id }).from(appUsers);
    const [created] = await db
      .insert(appUsers)
      .values({
        uid: user.uid,
        email: user.email,
        displayName,
        photoUrl: user.picture,
        provider: user.provider,
        emailVerified: user.emailVerified,
        company,
        phone,
        plan,
        // the very first account to sign in owns the workspace
        role: count.length === 0 ? "owner" : "member",
      })
      .returning();

    return Response.json({ data: created, created: true }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not verify session.";
    return Response.json({ error: message }, { status: 401 });
  }
}
