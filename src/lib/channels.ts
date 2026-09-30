import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  contacts,
  deals,
  integrationConnections,
  m365Items,
  shopifyOrders,
  slackMessages,
  stripeInvoices,
  whatsappMessages,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { stageMeta } from "@/lib/crm";

export const CHANNEL_APPS = [
  "slack",
  "whatsapp",
  "stripe",
  "shopify",
  "microsoft",
] as const;

export type ChannelApp = (typeof CHANNEL_APPS)[number];

let seedPromise: Promise<void> | null = null;

async function connectionConfig(appKey: string) {
  const [row] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.appKey, appKey));
  if (!row) return null;
  try {
    return {
      row,
      config: JSON.parse(row.config ?? "{}") as Record<string, string>,
    };
  } catch {
    return { row, config: {} as Record<string, string> };
  }
}

async function ensureApp(appKey: string, config: Record<string, string>, connectedBy: string) {
  const existing = await connectionConfig(appKey);
  if (existing) return;
  await db.insert(integrationConnections).values({
    appKey,
    status: "connected",
    config: JSON.stringify(config),
    connectedBy,
  });
}

async function runChannelSeed() {
  await ensureSeed();
  await ensureApp("slack", { channel: "#revenue-alerts" }, "Amara Okafor");
  await ensureApp("whatsapp", { phone: "+234 802 411 0142" }, "Amara Okafor");
  await ensureApp("stripe", { mode: "test", currency: "NGN" }, "Priya Raman");
  await ensureApp("shopify", { store: "sunrise.myshopify.com" }, "Noah Balogun");
  await ensureApp("microsoft", { tenant: "nexagrowth.onmicrosoft.com" }, "Amara Okafor");

  const slackCount = await db.select({ id: slackMessages.id }).from(slackMessages).limit(1);
  if (slackCount.length === 0) {
    await db.insert(slackMessages).values([
      {
        channel: "#revenue-alerts",
        author: "NexagrowthCRM",
        body: "Workspace connected. Deal stage changes will land in this channel.",
      },
      {
        channel: "#revenue-alerts",
        author: "Amara Okafor",
        body: "Vertex Manufacturing moved to Qualified. Security review is on the calendar.",
      },
      {
        channel: "#revenue-alerts",
        author: "Priya Raman",
        body: "Fintech Hive Africa invoice paid ₦213M. Onboarding workshop is booked.",
      },
    ]);
  }

  const waCount = await db.select({ id: whatsappMessages.id }).from(whatsappMessages).limit(1);
  if (waCount.length === 0) {
    const [dami] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.email, "dami@sunriseretail.ng"));
    await db.insert(whatsappMessages).values([
      {
        phone: "+234 812 555 7700",
        contactName: "Damilola Whitmore",
        direction: "in",
        body: "Can the storefront and WhatsApp live on one NexagrowthCRM account?",
        contactId: dami?.id ?? null,
        dealId: null,
      },
      {
        phone: "+234 812 555 7700",
        contactName: "Noah Balogun",
        direction: "out",
        body: "Yes — I started your trial and pre-connected both channels.",
        contactId: dami?.id ?? null,
        dealId: null,
      },
      {
        phone: "+234 807 946 0833",
        contactName: "Grace Okoro",
        direction: "in",
        body: "Please send appointment reminders to patients on WhatsApp.",
        contactId: null,
        dealId: null,
      },
    ]);
  }

  const invoiceCount = await db
    .select({ id: stripeInvoices.id })
    .from(stripeInvoices)
    .limit(1);
  if (invoiceCount.length === 0) {
    const allDeals = await db.select().from(deals);
    const won = allDeals.find((deal) => deal.stage === "won");
    const open = allDeals.find((deal) => deal.stage === "negotiation") ?? allDeals[0];
    await db.insert(stripeInvoices).values([
      {
        number: "NXG-1042",
        dealId: won?.id ?? null,
        customerName: won?.title ?? "Fintech Hive Africa",
        customerEmail: "partners@fintechhive.africa",
        amount: won?.amount ?? "213000000.00",
        status: "paid",
        paidAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        number: "NXG-1048",
        dealId: open?.id ?? null,
        customerName: open?.title ?? "Northwind Analytics Nigeria",
        customerEmail: "elena.vargas@northwind-analytics.ng",
        amount: open?.amount ?? "81000000.00",
        status: "open",
      },
    ]);
  }

  const orderCount = await db.select({ id: shopifyOrders.id }).from(shopifyOrders).limit(1);
  if (orderCount.length === 0) {
    await db.insert(shopifyOrders).values([
      {
        orderNumber: "#1088",
        customerName: "Damilola Whitmore",
        email: "dami@sunriseretail.ng",
        items: "Storefront theme · WhatsApp checkout",
        total: "14400000.00",
        status: "unfulfilled",
      },
      {
        orderNumber: "#1091",
        customerName: "Lekan Ojo",
        email: "lekan@studiofornax.ng",
        items: "Agency starter annual",
        total: "7200000.00",
        status: "fulfilled",
      },
      {
        orderNumber: "#1094",
        customerName: "Aisha Bello",
        email: "aisha.bello@brightpath.edu.ng",
        items: "Admissions landing page",
        total: "3600000.00",
        status: "unfulfilled",
      },
    ]);
  }

  const mailCount = await db.select({ id: m365Items.id }).from(m365Items).limit(1);
  if (mailCount.length === 0) {
    await db.insert(m365Items).values([
      {
        kind: "email",
        subject: "Security questionnaire — Northwind",
        body: "Legal asked for the DPA and SOC2 summary before Friday.",
        participants: "elena.vargas@northwind-analytics.ng",
        scheduledAt: new Date(Date.now() - 5 * 3600000),
      },
      {
        kind: "meeting",
        subject: "Vertex procurement review",
        body: "Walk through quote approvals and data residency.",
        participants: "m.adeleke@vertex-mfg.ng",
        scheduledAt: new Date(Date.now() + 26 * 3600000),
      },
      {
        kind: "email",
        subject: "Re: Sahel Logistics proposal v2",
        body: "Steering committee meets Tuesday. Please hold pricing.",
        participants: "tomiwa@sahellogistics.ng",
        scheduledAt: new Date(Date.now() - 20 * 3600000),
      },
    ]);
  }
}

export function ensureChannelSeed() {
  if (!seedPromise) {
    seedPromise = runChannelSeed().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

export async function assertConnected(appKey: ChannelApp) {
  await ensureChannelSeed();
  const connection = await connectionConfig(appKey);
  if (!connection || connection.row.status !== "connected") {
    throw new Error(`Connect ${appKey} in the marketplace before using this module.`);
  }
  return connection;
}

function textOf(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export async function syncConnectedApps(event: string, data: unknown) {
  try {
    await ensureChannelSeed();
    const record = (data ?? {}) as {
      id?: number;
      title?: string;
      stage?: string;
      amount?: string;
      fullName?: string;
      email?: string;
      company?: string | null;
    };
    const slack = await connectionConfig("slack");
    if (slack && ["deal.created", "deal.stage_changed", "lead.captured"].includes(event)) {
      const channel = slack.config.channel || "#revenue-alerts";
      let body = `Event ${event}`;
      if (event === "lead.captured") {
        body = `New website lead: ${record.fullName ?? "Unknown"} (${record.email ?? "no email"}) · plan interest ${record.company ?? "n/a"}`;
      } else if (event === "deal.stage_changed") {
        body = `${record.title ?? "Deal"} moved to ${record.stage ?? "a new stage"}.`;
      } else if (event === "deal.created") {
        body = `New deal: ${record.title ?? "Untitled"} · ₦${Number(record.amount ?? 0).toLocaleString("en-NG")}`;
      }
      await db.insert(slackMessages).values({
        channel,
        author: "NexagrowthCRM",
        body,
        dealId: record.id ?? null,
      });
    }

    if (event === "deal.stage_changed" && record.stage === "won" && record.id) {
      const stripe = await connectionConfig("stripe");
      if (stripe) {
        const existing = await db
          .select()
          .from(stripeInvoices)
          .where(eq(stripeInvoices.dealId, record.id));
        if (!existing.some((invoice) => invoice.status !== "refunded")) {
          const count = await db.select({ id: stripeInvoices.id }).from(stripeInvoices);
          await db.insert(stripeInvoices).values({
            number: `NXG-${1100 + count.length}`,
            dealId: record.id,
            customerName: record.title ?? "Won deal",
            customerEmail: null,
            amount: record.amount ?? "0",
            status: "open",
          });
          if (slack) {
            await db.insert(slackMessages).values({
              channel: slack.config.channel || "#revenue-alerts",
              author: "Stripe",
              body: `Draft invoice opened for ${record.title ?? "a won deal"}.`,
              dealId: record.id,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("syncConnectedApps failed", error);
  }
}

export async function getSlackWorkspace() {
  const connection = await assertConnected("slack");
  const channel = connection.config.channel || "#revenue-alerts";
  const messages = await db
    .select()
    .from(slackMessages)
    .where(eq(slackMessages.channel, channel))
    .orderBy(slackMessages.createdAt);
  const other = await db.select().from(slackMessages).orderBy(desc(slackMessages.createdAt)).limit(40);
  const dealRows = await db.select({ id: deals.id, title: deals.title }).from(deals);
  return { channel, messages: messages.length ? messages : other, deals: dealRows };
}

export async function postSlack(input: { body?: string; author?: string; dealId?: number | null }) {
  const connection = await assertConnected("slack");
  const body = textOf(input.body);
  if (body.length < 1) throw new Error("Write a message first.");
  const [created] = await db
    .insert(slackMessages)
    .values({
      channel: connection.config.channel || "#revenue-alerts",
      author: textOf(input.author, "Amara Okafor"),
      body: body.slice(0, 2000),
      dealId: input.dealId ?? null,
    })
    .returning();
  return created;
}

export async function getWhatsappInbox() {
  const connection = await assertConnected("whatsapp");
  const messages = await db
    .select()
    .from(whatsappMessages)
    .orderBy(whatsappMessages.createdAt);
  return { businessNumber: connection.config.phone || "+234 802 411 0142", messages };
}

async function upsertWhatsappContact(name: string, phone: string): Promise<{
  contactId: number;
  dealId: number | null;
  createdDeal: typeof deals.$inferSelect | null;
}> {
  const existing = await db.select().from(contacts);
  const found = existing.find((contact) => contact.phone === phone);
  if (found) {
    const [deal] = await db
      .select()
      .from(deals)
      .where(eq(deals.contactId, found.id));
    return { contactId: found.id, dealId: deal?.id ?? null, createdDeal: null };
  }
  const [firstName, ...rest] = name.split(/\s+/);
  const [created] = await db
    .insert(contacts)
    .values({
      firstName: (firstName || "WhatsApp").slice(0, 100),
      lastName: rest.join(" ").slice(0, 100),
      phone,
      source: "WhatsApp",
      stage: "lead",
      owner: "Noah Balogun",
      tags: "whatsapp",
    })
    .returning();
  const [deal] = await db
    .insert(deals)
    .values({
      title: `${name} — WhatsApp inquiry`,
      contactId: created.id,
      amount: "0",
      stage: "new",
      probability: stageMeta("new").probability,
      owner: "Noah Balogun",
      source: "WhatsApp",
      notes: "Opened from the WhatsApp channel.",
    })
    .returning();
  return { contactId: created.id, dealId: deal.id, createdDeal: deal };
}

export async function receiveWhatsapp(input: { name?: string; phone?: string; body?: string }) {
  await assertConnected("whatsapp");
  const phone = textOf(input.phone);
  const body = textOf(input.body);
  const name = textOf(input.name, "WhatsApp lead");
  if (phone.length < 5) throw new Error("Enter a phone number.");
  if (!body) throw new Error("Enter the inbound message.");
  const linked = await upsertWhatsappContact(name, phone);
  const [message] = await db
    .insert(whatsappMessages)
    .values({
      phone,
      contactName: name,
      direction: "in",
      body: body.slice(0, 2000),
      contactId: linked.contactId,
      dealId: linked.dealId,
    })
    .returning();
  await db.insert(activities).values({
    type: "note",
    subject: `WhatsApp from ${name}`,
    body,
    contactId: linked.contactId,
    dealId: linked.dealId,
    owner: "WhatsApp",
    outcome: "positive",
  });
  return {
    message,
    contactId: linked.contactId,
    dealId: linked.dealId,
    createdDeal: linked.createdDeal,
  };
}

export async function replyWhatsapp(input: { phone?: string; body?: string }) {
  await assertConnected("whatsapp");
  const phone = textOf(input.phone);
  const body = textOf(input.body);
  if (!phone || !body) throw new Error("Choose a thread and write a reply.");
  const history = await db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.phone, phone));
  const latest = history[history.length - 1];
  const [message] = await db
    .insert(whatsappMessages)
    .values({
      phone,
      contactName: "You",
      direction: "out",
      body: body.slice(0, 2000),
      contactId: latest?.contactId ?? null,
      dealId: latest?.dealId ?? null,
    })
    .returning();
  if (latest?.contactId) {
    await db.insert(activities).values({
      type: "note",
      subject: "WhatsApp reply",
      body,
      contactId: latest.contactId,
      dealId: latest.dealId,
      owner: "Amara Okafor",
      outcome: "neutral",
    });
  }
  return message;
}

export {
  createInvoice,
  getStripeOverview as getStripeDesk,
  markInvoicePaid as setInvoicePaid,
  refundInvoice,
} from "@/lib/stripe";

export async function getShopifyDesk() {
  const connection = await assertConnected("shopify");
  const orders = await db.select().from(shopifyOrders).orderBy(desc(shopifyOrders.createdAt));
  return { store: connection.config.store || "sunrise.myshopify.com", orders };
}

export async function createShopifyOrder(input: {
  customerName?: string;
  email?: string;
  items?: string;
  total?: number;
}) {
  await assertConnected("shopify");
  const customerName = textOf(input.customerName, "Store customer");
  const count = await db.select({ id: shopifyOrders.id }).from(shopifyOrders);
  const [created] = await db
    .insert(shopifyOrders)
    .values({
      orderNumber: `#${1100 + count.length}`,
      customerName,
      email: textOf(input.email) || null,
      items: textOf(input.items, "Custom order"),
      total: String(Number(input.total ?? 0)),
      status: "unfulfilled",
    })
    .returning();
  return created;
}

export async function importShopifyOrder(id: number) {
  await assertConnected("shopify");
  const [order] = await db.select().from(shopifyOrders).where(eq(shopifyOrders.id, id));
  if (!order) throw new Error("Order not found.");
  if (order.dealId) throw new Error("This order is already in the CRM.");

  const allContacts = await db.select().from(contacts);
  let contact = order.email
    ? allContacts.find((item) => item.email === order.email)
    : undefined;
  let createdContact = false;
  if (!contact) {
    const [firstName, ...rest] = order.customerName.split(/\s+/);
    const [inserted] = await db
      .insert(contacts)
      .values({
        firstName: (firstName || "Store").slice(0, 100),
        lastName: rest.join(" ").slice(0, 100),
        email: order.email,
        source: "Shopify",
        stage: "opportunity",
        owner: "Noah Balogun",
        tags: "shopify",
      })
      .returning();
    contact = inserted;
    createdContact = true;
  }

  const [deal] = await db
    .insert(deals)
    .values({
      title: `Shopify ${order.orderNumber} — ${order.customerName}`,
      contactId: contact.id,
      amount: order.total,
      stage: "qualified",
      probability: stageMeta("qualified").probability,
      owner: "Noah Balogun",
      source: "Shopify",
      notes: order.items,
    })
    .returning();

  await db
    .update(shopifyOrders)
    .set({ status: "imported", contactId: contact.id, dealId: deal.id })
    .where(eq(shopifyOrders.id, id));

  await db.insert(activities).values({
    type: "note",
    subject: `Imported Shopify order ${order.orderNumber}`,
    body: order.items,
    contactId: contact.id,
    dealId: deal.id,
    owner: "Shopify",
    outcome: "positive",
  });

  return { deal, contact, createdContact };
}

export async function getMicrosoftDesk() {
  const connection = await assertConnected("microsoft");
  const items = await db.select().from(m365Items).orderBy(desc(m365Items.scheduledAt));
  const dealRows = await db.select({ id: deals.id, title: deals.title }).from(deals);
  return {
    tenant: connection.config.tenant || "nexagrowth.onmicrosoft.com",
    items,
    deals: dealRows,
  };
}

export async function createMicrosoftItem(input: {
  kind?: string;
  subject?: string;
  body?: string;
  participants?: string;
  scheduledAt?: string;
  dealId?: number | null;
}) {
  await assertConnected("microsoft");
  const kind = input.kind === "meeting" ? "meeting" : "email";
  const subject = textOf(input.subject);
  if (subject.length < 2) throw new Error("Add a subject.");
  const when = input.scheduledAt ? new Date(input.scheduledAt) : new Date();
  const [created] = await db
    .insert(m365Items)
    .values({
      kind,
      subject: subject.slice(0, 220),
      body: textOf(input.body) || null,
      participants: textOf(input.participants) || null,
      scheduledAt: Number.isNaN(when.getTime()) ? new Date() : when,
      dealId: input.dealId ?? null,
    })
    .returning();
  if (input.dealId) {
    await db.insert(activities).values({
      type: kind === "meeting" ? "meeting" : "email",
      subject,
      body: textOf(input.body) || null,
      dealId: input.dealId,
      owner: "Microsoft 365",
      outcome: "neutral",
    });
  }
  return created;
}
