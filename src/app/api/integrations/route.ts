import {
  connectApp,
  createToken,
  createWebhook,
  deleteWebhook,
  disconnectApp,
  getIntegrationOverview,
  ingestInboundLead,
  revokeToken,
  testWebhook,
  toggleWebhook,
} from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getIntegrationOverview();
  return Response.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    let message = "Saved";
    let result: unknown = null;

    switch (action) {
      case "connect":
        await connectApp(
          String(body.appKey ?? ""),
          (body.config ?? {}) as Record<string, unknown>,
        );
        message = "App connected";
        break;
      case "disconnect":
        await disconnectApp(String(body.appKey ?? ""));
        message = "App disconnected";
        break;
      case "create_webhook":
        await createWebhook({
          name: String(body.name ?? ""),
          url: String(body.url ?? ""),
          events: Array.isArray(body.events) ? body.events.map(String) : [],
        });
        message = "Webhook subscribed";
        break;
      case "delete_webhook":
        await deleteWebhook(Number(body.id));
        message = "Webhook removed";
        break;
      case "toggle_webhook":
        await toggleWebhook(Number(body.id), Boolean(body.active));
        message = body.active ? "Webhook enabled" : "Webhook paused";
        break;
      case "test_webhook":
        await testWebhook(Number(body.id));
        message = "Test ping sent";
        break;
      case "create_token":
        result = await createToken(String(body.name ?? ""));
        message = "API token created";
        break;
      case "revoke_token":
        await revokeToken(Number(body.id));
        message = "Token revoked";
        break;
      case "sample_lead": {
        const overview = await getIntegrationOverview();
        const token = overview.tokens.find((item) => !item.revoked);
        if (!token) throw new Error("Create an API token first.");
        const stamp = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        result = await ingestInboundLead(token.token, {
          name: "Jordan Blake",
          email: "jordan.blake@orbitmedia.co",
          phone: "+234 813 555 0198",
          company: "Orbit Media",
          title: `Orbit Media — webhook lead ${stamp}`,
          amount: 18000,
          message: "Requested a product tour from the website webhook.",
        });
        message = "Sample lead written to the pipeline";
        break;
      }
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    const data = await getIntegrationOverview();
    return Response.json({ data, message, result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
}
