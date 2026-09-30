import { db } from "@/db";
import { trialRequests } from "@/db/schema";
import { emitEvent } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (fullName.length < 2) {
      return Response.json({ error: "Please enter your name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const [created] = await db
      .insert(trialRequests)
      .values({
        fullName,
        email,
        company: String(body.company ?? "").trim() || null,
        phone: String(body.phone ?? "").trim() || null,
        teamSize: String(body.teamSize ?? "").trim() || null,
        plan: String(body.plan ?? "professional").trim() || "professional",
        message: String(body.message ?? "").trim() || null,
      })
      .returning();

    await emitEvent("lead.captured", created);
    return Response.json({ data: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
}

export async function GET() {
  const rows = await db.select().from(trialRequests);
  return Response.json({ count: rows.length });
}
