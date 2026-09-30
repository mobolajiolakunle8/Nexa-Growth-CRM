import {
  createMicrosoftItem,
  createShopifyOrder,
  getMicrosoftDesk,
  getShopifyDesk,
  getSlackWorkspace,
  getWhatsappInbox,
  importShopifyOrder,
  postSlack,
  receiveWhatsapp,
  replyWhatsapp,
  type ChannelApp,
} from "@/lib/channels";
import { getStripeOverview } from "@/lib/stripe";
import { emitEvent } from "@/lib/integrations";

export const dynamic = "force-dynamic";

const APPS = ["slack", "whatsapp", "stripe", "shopify", "microsoft"] as const;

function isApp(value: string | null): value is ChannelApp {
  return APPS.includes(value as ChannelApp);
}

async function payloadFor(app: ChannelApp) {
  switch (app) {
    case "slack":
      return getSlackWorkspace();
    case "whatsapp":
      return getWhatsappInbox();
    case "stripe":
      return getStripeOverview();
    case "shopify":
      return getShopifyDesk();
    case "microsoft":
      return getMicrosoftDesk();
  }
}

export async function GET(request: Request) {
  const app = new URL(request.url).searchParams.get("app");
  if (!isApp(app)) {
    return Response.json({ error: "Unknown channel" }, { status: 404 });
  }
  try {
    return Response.json({ data: await payloadFor(app) });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const app = String(body.app ?? "");
    if (!isApp(app)) {
      return Response.json({ error: "Unknown channel" }, { status: 404 });
    }
    const action = String(body.action ?? "");
    let message = "Saved";

    switch (action) {
      case "slack_post":
        await postSlack({
          body: String(body.body ?? ""),
          author: String(body.author ?? "Amara Okafor"),
          dealId: body.dealId ? Number(body.dealId) : null,
        });
        message = "Posted to Slack";
        break;
      case "whatsapp_in": {
        const received = await receiveWhatsapp({
          name: String(body.name ?? ""),
          phone: String(body.phone ?? ""),
          body: String(body.body ?? ""),
        });
        if (received.createdDeal) {
          await emitEvent("deal.created", received.createdDeal);
        }
        message = "Inbound WhatsApp saved";
        break;
      }
      case "whatsapp_reply":
        await replyWhatsapp({
          phone: String(body.phone ?? ""),
          body: String(body.body ?? ""),
        });
        message = "Reply sent";
        break;
      case "stripe_create":
      case "stripe_paid":
      case "stripe_refund":
        return Response.json(
          { error: "Use /api/channels/stripe for Stripe actions." },
          { status: 400 },
        );
      case "shopify_create":
        await createShopifyOrder({
          customerName: String(body.customerName ?? ""),
          email: String(body.email ?? ""),
          items: String(body.items ?? ""),
          total: Number(body.total ?? 0),
        });
        message = "Order added";
        break;
      case "shopify_import": {
        const imported = await importShopifyOrder(Number(body.id));
        if (imported.createdContact) {
          await emitEvent("contact.created", imported.contact);
        }
        await emitEvent("deal.created", imported.deal);
        message = "Order imported into the pipeline";
        break;
      }
      case "m365_create":
        await createMicrosoftItem({
          kind: String(body.kind ?? "email"),
          subject: String(body.subject ?? ""),
          body: String(body.body ?? ""),
          participants: String(body.participants ?? ""),
          scheduledAt: String(body.scheduledAt ?? ""),
          dealId: body.dealId ? Number(body.dealId) : null,
        });
        message = "Saved to Microsoft 365";
        break;
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    return Response.json({ data: await payloadFor(app), message });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
}
