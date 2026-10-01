import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  apiTokens,
  contacts,
  deals,
  inboundEvents,
  integrationConnections,
  webhookDeliveries,
  webhookEndpoints,
} from "@/db/schema";
import { syncConnectedApps } from "@/lib/channels";
import { APP_CATALOG, ECHO_URL, WEBHOOK_EVENTS } from "@/lib/integration-catalog";

export { APP_CATALOG, ECHO_URL, WEBHOOK_EVENTS } from "@/lib/integration-catalog";

const RESOURCE_EVENT: Record<string, string> = {
  deals: "deal",
  contacts: "contact",
  companies: "company",
  tasks: "task",
  activities: "activity",
};

export function resourceEvent(
  resource: string,
  action: "created" | "updated",
) {
  return `${RESOURCE_EVENT[resource] ?? resource}.${action}`;
}

let seedPromise: Promise<void> | null = null;

async function runIntegrationSeed() {
  return;
  const existing = await db
    .select({ id: integrationConnections.id })
    .from(integrationConnections)
    .limit(1);

  if (existing.length === 0) {
    await db.insert(integrationConnections).values([
      {
        appKey: "slack",
        config: JSON.stringify({ channel: "#revenue-alerts" }),
        connectedBy: "Amara Okafor",
      },
      {
        appKey: "whatsapp",
        config: JSON.stringify({ phone: "+234 802 411 0142" }),
        connectedBy: "Amara Okafor",
      },
      {
        appKey: "stripe",
        config: JSON.stringify({ mode: "test" }),
        connectedBy: "Priya Raman",
      },
    ]);
  }

  const tokens = await db.select({ id: apiTokens.id }).from(apiTokens).limit(1);
  if (tokens.length === 0) {
    await db.insert(apiTokens).values({
      name: "Website & forms",
      token: "nxg_live_demo_website_forms",
      scopes: "crm:read,crm:write",
    });
  }

  const hooks = await db
    .select({ id: webhookEndpoints.id })
    .from(webhookEndpoints)
    .limit(1);
  if (hooks.length === 0) {
    await db.insert(webhookEndpoints).values({
      name: "Revenue alerts echo",
      url: ECHO_URL,
      events: "deal.created,deal.stage_changed,lead.captured,contact.created",
      secret: "nxg_whsec_demo_revenue",
      active: true,
    });
  }
}

export function ensureIntegrationSeed() {
  if (!seedPromise) {
    seedPromise = runIntegrationSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

function randomToken(prefix: string) {
  const raw = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  return `${prefix}${raw.slice(0, 32)}`;
}

function isEchoUrl(raw: string) {
  try {
    const url = new URL(raw);
    return (
      url.hostname === "hooks.nexagrowthcrm.com" ||
      url.pathname.includes("/api/hooks/echo")
    );
  } catch {
    return false;
  }
}

function isPublicHttpUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.endsWith(".internal") ||
      host === "0.0.0.0" ||
      host === "::1"
    ) {
      return false;
    }
    if (
      /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.)/.test(
        host,
      )
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function assertWebhookUrl(raw: string) {
  if (isEchoUrl(raw) || isPublicHttpUrl(raw)) return;
  throw new Error(
    "Use a public http(s) URL, or the built-in echo receiver: https://hooks.nexagrowthcrm.com/echo",
  );
}

async function deliver(
  endpoint: {
    id: number;
    name: string;
    url: string;
    secret: string;
  },
  event: string,
  data: unknown,
) {
  const payload = {
    event,
    sentAt: new Date().toISOString(),
    workspace: "nexagrowth-demo",
    data,
  };
  const body = JSON.stringify(payload);
  let status = "failed";
  let responseCode: number | null = null;
  let responseBody = "";

  try {
    if (isEchoUrl(endpoint.url)) {
      status = "delivered";
      responseCode = 200;
      responseBody = "Accepted by the Nexagrowth echo receiver.";
      await db.insert(inboundEvents).values({
        source: "echo",
        payload: body,
      });
    } else if (!isPublicHttpUrl(endpoint.url)) {
      status = "blocked";
      responseBody = "Refused: URL is not a public HTTP endpoint.";
    } else {
      const response = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Nexagrowth-Event": event,
          "X-Nexagrowth-Signature": endpoint.secret,
        },
        body,
        signal: AbortSignal.timeout(4000),
      });
      responseCode = response.status;
      responseBody = (await response.text()).slice(0, 500);
      status = response.ok ? "delivered" : "failed";
    }
  } catch (error) {
    status = "failed";
    responseBody = error instanceof Error ? error.message : "Delivery failed";
  }

  await db.insert(webhookDeliveries).values({
    endpointId: endpoint.id,
    endpointName: endpoint.name,
    event,
    payload: body,
    status,
    responseCode,
    responseBody,
  });
}

export async function emitEvent(event: string, data: unknown) {
  try {
    await ensureIntegrationSeed();
    const endpoints = await db
      .select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.active, true));

    for (const endpoint of endpoints) {
      const subscribed = endpoint.events.split(",").map((item) => item.trim());
      if (!subscribed.includes(event) && !subscribed.includes("*")) continue;
      await deliver(endpoint, event, data);
    }
    await syncConnectedApps(event, data);
  } catch (error) {
    console.error("emitEvent failed", error);
  }
}

export async function getIntegrationOverview() {
  await ensureIntegrationSeed();
  const [connections, endpoints, deliveries, tokens, echoes] = await Promise.all([
    db
      .select()
      .from(integrationConnections)
      .orderBy(desc(integrationConnections.connectedAt)),
    db.select().from(webhookEndpoints).orderBy(desc(webhookEndpoints.createdAt)),
    db
      .select()
      .from(webhookDeliveries)
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(20),
    db.select().from(apiTokens).orderBy(desc(apiTokens.createdAt)),
    db
      .select()
      .from(inboundEvents)
      .where(eq(inboundEvents.source, "echo"))
      .orderBy(desc(inboundEvents.createdAt))
      .limit(8),
  ]);

  return { connections, endpoints, deliveries, tokens, echoes };
}

export async function connectApp(
  appKey: string,
  config: Record<string, unknown>,
  connectedBy = "Amara Okafor",
) {
  const app = APP_CATALOG.find((item) => item.key === appKey);
  if (!app) throw new Error("Unknown app");

  const cleanConfig: Record<string, string> = {};
  for (const field of app.fields) {
    const value = String(config[field.key] ?? "").trim();
    if (!value) throw new Error(`${field.label} is required to connect ${app.name}.`);
    cleanConfig[field.key] = value.slice(0, 180);
  }

  const [existing] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.appKey, appKey));

  if (existing) {
    await db
      .update(integrationConnections)
      .set({
        status: "connected",
        config: JSON.stringify(cleanConfig),
        connectedBy,
        connectedAt: new Date(),
      })
      .where(eq(integrationConnections.id, existing.id));
  } else {
    await db.insert(integrationConnections).values({
      appKey,
      status: "connected",
      config: JSON.stringify(cleanConfig),
      connectedBy,
    });
  }
}

export async function disconnectApp(appKey: string) {
  await db
    .delete(integrationConnections)
    .where(eq(integrationConnections.appKey, appKey));
}

export async function createWebhook(input: {
  name?: string;
  url?: string;
  events?: string[];
}) {
  const name = String(input.name ?? "").trim();
  const url = String(input.url ?? "").trim();
  const events = (input.events ?? []).filter((event) =>
    WEBHOOK_EVENTS.some((item) => item.key === event && item.key !== "webhook.test"),
  );
  if (name.length < 2) throw new Error("Give the webhook a name.");
  assertWebhookUrl(url);
  if (events.length === 0) throw new Error("Select at least one event.");

  await db.insert(webhookEndpoints).values({
    name: name.slice(0, 160),
    url: url.slice(0, 500),
    events: events.join(","),
    secret: randomToken("nxg_whsec_"),
    active: true,
  });
}

export async function deleteWebhook(id: number) {
  await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));
}

export async function toggleWebhook(id: number, active: boolean) {
  await db
    .update(webhookEndpoints)
    .set({ active })
    .where(eq(webhookEndpoints.id, id));
}

export async function testWebhook(id: number) {
  const [endpoint] = await db
    .select()
    .from(webhookEndpoints)
    .where(eq(webhookEndpoints.id, id));
  if (!endpoint) throw new Error("Webhook not found");
  await deliver(endpoint, "webhook.test", {
    message: "Test ping from NexagrowthCRM",
    by: "Amara Okafor",
  });
}

export async function createToken(name: string) {
  const label = name.trim();
  if (label.length < 2) throw new Error("Name the token so you can recognise it later.");
  const [created] = await db
    .insert(apiTokens)
    .values({
      name: label.slice(0, 120),
      token: randomToken("nxg_live_"),
      scopes: "crm:read,crm:write",
    })
    .returning();
  return created;
}

export async function revokeToken(id: number) {
  await db.update(apiTokens).set({ revoked: true }).where(eq(apiTokens.id, id));
}

export async function ingestInboundLead(
  token: string,
  body: Record<string, unknown>,
) {
  await ensureIntegrationSeed();
  const [apiToken] = await db
    .select()
    .from(apiTokens)
    .where(eq(apiTokens.token, token));
  if (!apiToken || apiToken.revoked) {
    throw new Error("Invalid or revoked API token.");
  }

  await db
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, apiToken.id));

  const fullName = String(body.name ?? body.fullName ?? "Inbound lead").trim() || "Inbound lead";
  const [firstName, ...rest] = fullName.split(/\s+/);
  const email = String(body.email ?? "").trim() || null;
  const phone = String(body.phone ?? "").trim() || null;
  const company = String(body.company ?? "").trim();
  const title =
    String(body.title ?? "").trim() ||
    `${company || fullName} — inbound webhook`;
  const amount = Number(body.amount ?? 0);
  const message = String(body.message ?? "Created from an inbound webhook.").trim();

  const [contact] = await db
    .insert(contacts)
    .values({
      firstName: firstName.slice(0, 100),
      lastName: rest.join(" ").slice(0, 100),
      email,
      phone,
      position: String(body.position ?? "").trim() || null,
      source: "Webhook",
      stage: "lead",
      owner: "Amara Okafor",
      tags: "inbound,webhook",
    })
    .returning();

  const [deal] = await db
    .insert(deals)
    .values({
      title: title.slice(0, 200),
      contactId: contact.id,
      amount: String(Number.isFinite(amount) ? amount : 0),
      stage: "new",
      probability: 15,
      owner: "Amara Okafor",
      source: "Webhook",
      notes: company ? `${message}\nCompany: ${company}` : message,
    })
    .returning();

  await db.insert(activities).values({
    type: "note",
    subject: `Inbound webhook · ${apiToken.name}`,
    body: message,
    dealId: deal.id,
    contactId: contact.id,
    owner: "Integration",
    outcome: "positive",
  });

  await db.insert(inboundEvents).values({
    source: apiToken.name,
    payload: JSON.stringify(body).slice(0, 4000),
    dealId: deal.id,
    contactId: contact.id,
  });

  await emitEvent("contact.created", contact);
  await emitEvent("deal.created", deal);

  return { contact, deal };
}
