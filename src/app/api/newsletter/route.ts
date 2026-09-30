import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = String(body.email ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    const [created] = await db
      .insert(newsletterSubscribers)
      .values({ email })
      .returning();
    return Response.json({ data: created }, { status: 201 });
  } catch {
    return Response.json({ error: "Could not subscribe." }, { status: 400 });
  }
}
