import { ingestInboundLead } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await ingestInboundLead(token, body);
    return Response.json(
      {
        ok: true,
        contactId: result.contact.id,
        dealId: result.deal.id,
        title: result.deal.title,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rejected";
    const status = message.includes("token") ? 401 : 400;
    return Response.json({ error: message }, { status });
  }
}
