import { desc } from "drizzle-orm";
import { db } from "@/db";
import { appUsers } from "@/db/schema";
import { requireUser } from "@/lib/firebase/verify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const rows = await db
      .select({
        id: appUsers.id,
        email: appUsers.email,
        displayName: appUsers.displayName,
        photoUrl: appUsers.photoUrl,
        provider: appUsers.provider,
        role: appUsers.role,
        emailVerified: appUsers.emailVerified,
        lastLoginAt: appUsers.lastLoginAt,
        createdAt: appUsers.createdAt,
      })
      .from(appUsers)
      .orderBy(desc(appUsers.lastLoginAt))
      .limit(50);
    return Response.json({ data: rows });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unauthorised" },
      { status: 401 },
    );
  }
}
