import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  contacts,
  deals,
  integrationConnections,
  stripeCheckoutSessions,
  stripeCustomers,
  stripeEvents,
  stripeInvoices,
  stripeProducts,
  stripeSubscriptions,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { stageMeta } from "@/lib/crm";

let stripeSeedPromise: Promise<void> | null = null;

const CARD_BRANDS = ["Visa", "Mastercard", "Amex", "Discover"];

function pickCard(index: number) {
  return {
    brand: CARD_BRANDS[index % CARD_BRANDS.length],
    last4: String(4200 + index * 137).slice(-4),
    exp: `${((index % 11) + 1).toString().padStart(2, "0")}/2${8 + (index % 3)}`,
  };
}

function makeToken() {
  const raw = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
  return `cs_test_${raw.slice(0, 26)}`;
}

async function connection() {
  const [row] = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.appKey, "stripe"));
  return row;
}

export async function assertStripeConnected() {
  const row = await connection();
  if (!row || row.status !== "connected") {
    throw new Error("Connect Stripe in the marketplace first.");
  }
  return row;
}

async function ensureStripeInstalled() {
  const existing = await connection();
  if (existing) return;
  await db.insert(integrationConnections).values({
    appKey: "stripe",
    status: "connected",
    config: JSON.stringify({ mode: "test", currency: "NGN" }),
    connectedBy: "Priya Raman",
  });
}

async function runStripeSeed() {
  await ensureSeed();
  await ensureStripeInstalled();

  const productCount = await db
    .select({ id: stripeProducts.id })
    .from(stripeProducts)
    .limit(1);
  if (productCount.length === 0) {
    await db.insert(stripeProducts).values([
      { name: "Standard workspace", interval: "month", price: "149000.00", currency: "NGN" },
      { name: "Professional workspace", interval: "month", price: "299000.00", currency: "NGN" },
      { name: "Enterprise workspace", interval: "month", price: "599000.00", currency: "NGN" },
      { name: "Professional workspace — annual", interval: "year", price: "2870000.00", currency: "NGN" },
      { name: "Migration & onboarding", interval: "one_time", price: "2250000.00", currency: "NGN" },
    ]);
  }

  const customerCount = await db
    .select({ id: stripeCustomers.id })
    .from(stripeCustomers)
    .limit(1);
  if (customerCount.length === 0) {
    const crmContacts = await db.select().from(contacts).limit(6);
    if (crmContacts.length > 0) {
      await db.insert(stripeCustomers).values(
        crmContacts.map((contact, index) => {
          const card = pickCard(index);
          return {
            name: `${contact.firstName} ${contact.lastName}`.trim(),
            email: contact.email,
            contactId: contact.id,
            cardBrand: card.brand,
            cardLast4: card.last4,
            cardExp: card.exp,
          };
        }),
      );
    }
  }

  const subscriptionCount = await db
    .select({ id: stripeSubscriptions.id })
    .from(stripeSubscriptions)
    .limit(1);
  if (subscriptionCount.length === 0) {
    const customers = await db.select().from(stripeCustomers).limit(4);
    const products = await db.select().from(stripeProducts);
    const allDeals = await db.select().from(deals);
    if (customers.length > 0 && products.length > 0) {
      const rows = customers.map((customer, index) => ({
        customerId: customer.id,
        productId: products[index % Math.min(products.length, 3)].id,
        dealId: allDeals[index]?.id ?? null,
        quantity: [12, 25, 6, 50][index] ?? 10,
        status: index === 3 ? "past_due" : "active",
        currentPeriodEnd: new Date(Date.now() + (10 + index * 6) * 86400000),
      }));
      await db.insert(stripeSubscriptions).values(rows);
    }
  }

  const invoiceCount = await db
    .select({ id: stripeInvoices.id })
    .from(stripeInvoices)
    .limit(1);
  if (invoiceCount.length === 0) {
    const allDeals = await db.select().from(deals);
    const won = allDeals.find((deal) => deal.stage === "won");
    const negotiation = allDeals.find((deal) => deal.stage === "negotiation") ?? allDeals[0];
    const customers = await db.select().from(stripeCustomers);
    await db.insert(stripeInvoices).values([
      {
        number: "NXG-1042",
        dealId: won?.id ?? null,
        customerId: customers[0]?.id ?? null,
        customerName: customers[0]?.name ?? "Fintech Hive",
        customerEmail: customers[0]?.email ?? "partners@fintechhive.africa",
        amount: won?.amount ?? "213000000.00",
        status: "paid",
        paymentMethod: "card",
        paidAt: new Date(Date.now() - 6 * 86400000),
      },
      {
        number: "NXG-1048",
        dealId: negotiation?.id ?? null,
        customerId: customers[1]?.id ?? null,
        customerName: customers[1]?.name ?? "Northwind Analytics",
        customerEmail: customers[1]?.email ?? "elena.vargas@northwind-analytics.com",
        amount: negotiation?.amount ?? "54000.00",
        status: "open",
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      },
      {
        number: "NXG-1054",
        dealId: null,
        customerId: customers[2]?.id ?? null,
        customerName: customers[2]?.name ?? "Lumen Dental",
        customerEmail: customers[2]?.email ?? null,
        amount: "18900000.00",
        status: "past_due",
        dueDate: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
        memo: "Retry with a fresh card on file.",
      },
    ]);
  }

  const eventCount = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .limit(1);
  if (eventCount.length === 0) {
    await db.insert(stripeEvents).values([
      {
        type: "invoice.paid",
        summary: "Invoice NXG-1042 paid by Fintech Hive · ₦213,000,000",
        amount: "213000000.00",
      },
      {
        type: "customer.subscription.created",
        summary: "Fintech Hive subscribed to Enterprise workspace",
      },
      {
        type: "invoice.payment_failed",
        summary: "Invoice NXG-1054 failed for Lumen Dental",
        amount: "18900000.00",
      },
    ]);
  }
}

export function ensureStripeSeed() {
  if (!stripeSeedPromise) {
    stripeSeedPromise = runStripeSeed().catch((error) => {
      stripeSeedPromise = null;
      throw error;
    });
  }
  return stripeSeedPromise;
}

export type StripeOverview = Awaited<ReturnType<typeof getStripeOverview>>;

export async function getStripeOverview() {
  await ensureStripeSeed();
  const [row, products, customers, subscriptions, invoices, sessions, events, dealRows] =
    await Promise.all([
      connection(),
      db.select().from(stripeProducts).orderBy(stripeProducts.id),
      db.select().from(stripeCustomers).orderBy(desc(stripeCustomers.createdAt)),
      db.select().from(stripeSubscriptions).orderBy(desc(stripeSubscriptions.createdAt)),
      db.select().from(stripeInvoices).orderBy(desc(stripeInvoices.createdAt)),
      db.select().from(stripeCheckoutSessions).orderBy(desc(stripeCheckoutSessions.createdAt)),
      db.select().from(stripeEvents).orderBy(desc(stripeEvents.createdAt)).limit(20),
      db.select({ id: deals.id, title: deals.title, amount: deals.amount, stage: deals.stage })
        .from(deals),
    ]);

  const config = (() => {
    try {
      return JSON.parse(row?.config ?? "{}") as Record<string, string>;
    } catch {
      return {} as Record<string, string>;
    }
  })();

  const productById = new Map(products.map((product) => [product.id, product]));

  const monthlyMrr = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((total, sub) => {
      const product = productById.get(sub.productId);
      if (!product) return total;
      const price = Number(product.price);
      const monthly =
        product.interval === "year"
          ? price / 12
          : product.interval === "one_time"
            ? 0
            : price;
      return total + monthly * sub.quantity;
    }, 0);

  const collected = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const outstanding = invoices
    .filter((invoice) => invoice.status === "open" || invoice.status === "past_due")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  return {
    mode: config.mode || "test",
    currency: config.currency || "NGN",
    products,
    customers,
    subscriptions,
    invoices,
    sessions,
    events,
    deals: dealRows,
    stats: {
      monthlyMrr,
      arr: monthlyMrr * 12,
      activeSubscriptions: subscriptions.filter((sub) => sub.status === "active").length,
      pastDueSubscriptions: subscriptions.filter((sub) => sub.status === "past_due").length,
      collected,
      outstanding,
      customerCount: customers.length,
    },
  };
}

async function nextInvoiceNumber() {
  const rows = await db.select({ id: stripeInvoices.id }).from(stripeInvoices);
  return `NXG-${1100 + rows.length}`;
}

function isoDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export async function createInvoice(input: {
  dealId?: number | null;
  customerId?: number | null;
  amount?: number;
  memo?: string;
  dueDate?: string | null;
  paymentMethod?: string;
}) {
  await assertStripeConnected();
  let customer = input.customerId
    ? (await db.select().from(stripeCustomers).where(eq(stripeCustomers.id, input.customerId)))[0]
    : undefined;
  const deal = input.dealId
    ? (await db.select().from(deals).where(eq(deals.id, input.dealId)))[0]
    : null;

  if (!customer && deal?.contactId) {
    customer = (
      await db.select().from(stripeCustomers).where(eq(stripeCustomers.contactId, deal.contactId))
    )[0];
    if (!customer) {
      const [contact] = await db.select().from(contacts).where(eq(contacts.id, deal.contactId));
      if (contact) {
        const card = pickCard(Date.now());
        const [inserted] = await db
          .insert(stripeCustomers)
          .values({
            name: `${contact.firstName} ${contact.lastName}`.trim(),
            email: contact.email,
            contactId: contact.id,
            cardBrand: card.brand,
            cardLast4: card.last4,
            cardExp: card.exp,
          })
          .returning();
        customer = inserted;
      }
    }
  }

  const amount = Number(
    input.amount !== undefined && input.amount !== null && !Number.isNaN(input.amount)
      ? input.amount
      : Number(deal?.amount ?? 0),
  );
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Enter an invoice amount greater than zero.");
  }

  const [created] = await db
    .insert(stripeInvoices)
    .values({
      number: await nextInvoiceNumber(),
      dealId: deal?.id ?? null,
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? deal?.title ?? "Customer",
      customerEmail: customer?.email ?? null,
      amount: amount.toFixed(2),
      status: "open",
      dueDate:
        isoDate(input.dueDate) ??
        new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      paymentMethod: input.paymentMethod?.trim() || "card",
      memo: input.memo?.trim() || null,
    })
    .returning();

  await db.insert(stripeEvents).values({
    type: "invoice.created",
    summary: `Invoice ${created.number} opened for ${created.customerName}`,
    amount: created.amount,
    invoiceId: created.id,
  });

  if (deal?.id) {
    await db.insert(activities).values({
      type: "note",
      subject: `Stripe invoice ${created.number} sent`,
      body: `Amount ${amount.toFixed(2)} · due ${created.dueDate ?? "shortly"}.`,
      dealId: deal.id,
      owner: "Stripe",
      outcome: "neutral",
    });
  }

  return created;
}

export async function markInvoicePaid(invoiceId: number) {
  await assertStripeConnected();
  const [invoice] = await db
    .select()
    .from(stripeInvoices)
    .where(eq(stripeInvoices.id, invoiceId));
  if (!invoice) throw new Error("Invoice not found.");
  if (invoice.status === "paid") return { invoice, deal: null };

  const [updated] = await db
    .update(stripeInvoices)
    .set({ status: "paid", paidAt: new Date() })
    .where(eq(stripeInvoices.id, invoiceId))
    .returning();

  let deal = null;
  if (invoice.dealId) {
    const [updatedDeal] = await db
      .update(deals)
      .set({
        stage: "won",
        probability: 100,
        updatedAt: new Date(),
        notes: `Marked won after Stripe invoice ${invoice.number} paid.`,
      })
      .where(eq(deals.id, invoice.dealId))
      .returning();
    deal = updatedDeal;
    await db.insert(activities).values({
      type: "note",
      subject: `Stripe payment ${invoice.number}`,
      body: "Payment captured. Deal moved to Closed won.",
      dealId: invoice.dealId,
      owner: "Stripe",
      outcome: "won",
    });
  }

  await db.insert(stripeEvents).values({
    type: "invoice.paid",
    summary: `Invoice ${invoice.number} paid · ${invoice.customerName}`,
    amount: invoice.amount,
    invoiceId: invoice.id,
  });

  return { invoice: updated, deal };
}

export async function markInvoiceFailed(invoiceId: number) {
  await assertStripeConnected();
  const [invoice] = await db
    .select()
    .from(stripeInvoices)
    .where(eq(stripeInvoices.id, invoiceId));
  if (!invoice) throw new Error("Invoice not found.");
  const [updated] = await db
    .update(stripeInvoices)
    .set({ status: "past_due" })
    .where(eq(stripeInvoices.id, invoiceId))
    .returning();
  await db.insert(stripeEvents).values({
    type: "invoice.payment_failed",
    summary: `Payment failed for ${invoice.number} · ${invoice.customerName}`,
    amount: invoice.amount,
    invoiceId: invoice.id,
  });
  if (invoice.dealId) {
    await db.insert(activities).values({
      type: "note",
      subject: `Stripe payment failed ${invoice.number}`,
      body: "Charge declined. Follow up with the customer.",
      dealId: invoice.dealId,
      owner: "Stripe",
      outcome: "negative",
    });
  }
  return updated;
}

export async function refundInvoice(invoiceId: number) {
  await assertStripeConnected();
  const [invoice] = await db
    .select()
    .from(stripeInvoices)
    .where(eq(stripeInvoices.id, invoiceId));
  if (!invoice) throw new Error("Invoice not found.");
  const [updated] = await db
    .update(stripeInvoices)
    .set({ status: "refunded" })
    .where(eq(stripeInvoices.id, invoiceId))
    .returning();
  await db.insert(stripeEvents).values({
    type: "charge.refunded",
    summary: `Refund issued for ${invoice.number}`,
    amount: invoice.amount,
    invoiceId: invoice.id,
  });
  if (invoice.dealId) {
    await db.insert(activities).values({
      type: "note",
      subject: `Stripe refund ${invoice.number}`,
      body: "Refund issued from the Stripe desk.",
      dealId: invoice.dealId,
      owner: "Stripe",
      outcome: "negative",
    });
  }
  return updated;
}

export async function voidInvoice(invoiceId: number) {
  await assertStripeConnected();
  const [invoice] = await db
    .select()
    .from(stripeInvoices)
    .where(eq(stripeInvoices.id, invoiceId));
  if (!invoice) throw new Error("Invoice not found.");
  const [updated] = await db
    .update(stripeInvoices)
    .set({ status: "void" })
    .where(eq(stripeInvoices.id, invoiceId))
    .returning();
  await db.insert(stripeEvents).values({
    type: "invoice.voided",
    summary: `Invoice ${invoice.number} voided`,
    invoiceId: invoice.id,
  });
  return updated;
}

export async function createProduct(input: {
  name?: string;
  interval?: string;
  price?: number;
}) {
  await assertStripeConnected();
  const name = input.name?.trim();
  if (!name) throw new Error("Give the product a name.");
  const price = Number(input.price ?? 0);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Enter a non-negative price.");
  }
  const interval =
    input.interval === "year" || input.interval === "one_time" ? input.interval : "month";
  const [created] = await db
    .insert(stripeProducts)
    .values({
      name: name.slice(0, 180),
      price: price.toFixed(2),
      interval,
    })
    .returning();
  await db.insert(stripeEvents).values({
    type: "product.created",
    summary: `Product ${created.name} added at $${price.toFixed(2)} / ${interval}`,
  });
  return created;
}

export async function toggleProduct(productId: number) {
  await assertStripeConnected();
  const [product] = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.id, productId));
  if (!product) throw new Error("Product not found.");
  const [updated] = await db
    .update(stripeProducts)
    .set({ active: !product.active })
    .where(eq(stripeProducts.id, productId))
    .returning();
  return updated;
}

export async function createSubscription(input: {
  customerId?: number;
  productId?: number;
  dealId?: number | null;
  quantity?: number;
}) {
  await assertStripeConnected();
  const customerId = Number(input.customerId);
  const productId = Number(input.productId);
  if (!customerId || !productId) throw new Error("Pick a customer and a product.");
  const [customer] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.id, customerId));
  const [product] = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.id, productId));
  if (!customer || !product) throw new Error("Customer or product missing.");
  const quantity = Math.max(1, Number(input.quantity ?? 1));

  const [created] = await db
    .insert(stripeSubscriptions)
    .values({
      customerId,
      productId,
      dealId: input.dealId ?? null,
      quantity,
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
    })
    .returning();

  await db.insert(stripeEvents).values({
    type: "customer.subscription.created",
    summary: `${customer.name} subscribed to ${product.name} × ${quantity}`,
    subscriptionId: created.id,
  });

  const price = Number(product.price) * quantity;
  const invoice = await createInvoice({
    dealId: input.dealId ?? null,
    customerId,
    amount: product.interval === "one_time" ? price : price,
    memo: `First period of ${product.name}`,
    dueDate: null,
  });

  return { subscription: created, invoice };
}

export async function cancelSubscription(subscriptionId: number) {
  await assertStripeConnected();
  const [subscription] = await db
    .select()
    .from(stripeSubscriptions)
    .where(eq(stripeSubscriptions.id, subscriptionId));
  if (!subscription) throw new Error("Subscription not found.");
  const [updated] = await db
    .update(stripeSubscriptions)
    .set({ status: "canceled" })
    .where(eq(stripeSubscriptions.id, subscriptionId))
    .returning();
  await db.insert(stripeEvents).values({
    type: "customer.subscription.deleted",
    summary: `Subscription #${subscription.id} canceled`,
    subscriptionId: subscription.id,
  });
  return updated;
}

export async function createCheckoutSession(input: {
  productId?: number;
  dealId?: number | null;
  email?: string;
}) {
  await assertStripeConnected();
  const productId = Number(input.productId);
  if (!productId) throw new Error("Pick a product for the checkout link.");
  const [product] = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.id, productId));
  if (!product) throw new Error("Product not found.");
  const token = makeToken();
  const [created] = await db
    .insert(stripeCheckoutSessions)
    .values({
      token,
      productId,
      dealId: input.dealId ?? null,
      amount: product.price,
      status: "open",
      customerEmail: input.email?.trim() || null,
    })
    .returning();
  await db.insert(stripeEvents).values({
    type: "checkout.session.created",
    summary: `Checkout link opened for ${product.name}`,
    amount: product.price,
  });
  return created;
}

export async function fulfilCheckoutSession(input: {
  token: string;
  email?: string;
  name?: string;
}) {
  await assertStripeConnected();
  const [session] = await db
    .select()
    .from(stripeCheckoutSessions)
    .where(eq(stripeCheckoutSessions.token, input.token));
  if (!session) throw new Error("Checkout session not found.");
  if (session.status === "completed") return session;

  const [product] = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.id, session.productId));
  const email = (input.email ?? session.customerEmail ?? "").trim();
  const name = input.name?.trim() || (email ? email.split("@")[0] : "Checkout customer");

  const card = pickCard(session.id);
  let customer =
    email &&
    (
      await db.select().from(stripeCustomers).where(eq(stripeCustomers.email, email))
    )[0];
  if (!customer) {
    const [inserted] = await db
      .insert(stripeCustomers)
      .values({
        name,
        email: email || null,
        cardBrand: card.brand,
        cardLast4: card.last4,
        cardExp: card.exp,
      })
      .returning();
    customer = inserted;
  }

  const invoice = await createInvoice({
    dealId: session.dealId,
    customerId: customer.id,
    amount: Number(session.amount),
    memo: product ? `Checkout · ${product.name}` : "Checkout payment",
  });
  const paid = await markInvoicePaid(invoice.id);

  const [updated] = await db
    .update(stripeCheckoutSessions)
    .set({
      status: "completed",
      completedAt: new Date(),
      customerEmail: email || session.customerEmail,
    })
    .where(eq(stripeCheckoutSessions.id, session.id))
    .returning();

  await db.insert(stripeEvents).values({
    type: "checkout.session.completed",
    summary: `Checkout completed by ${name} · ₦${Number(session.amount).toLocaleString("en-NG")}`,
    amount: session.amount,
    invoiceId: invoice.id,
  });

  return { session: updated, invoice: paid.invoice };
}

export async function importContactAsCustomer(contactId: number) {
  await assertStripeConnected();
  const [contact] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!contact) throw new Error("Contact not found.");
  const [existing] = await db
    .select()
    .from(stripeCustomers)
    .where(eq(stripeCustomers.contactId, contactId));
  if (existing) return existing;
  const card = pickCard(contactId);
  const [created] = await db
    .insert(stripeCustomers)
    .values({
      name: `${contact.firstName} ${contact.lastName}`.trim(),
      email: contact.email,
      contactId: contact.id,
      cardBrand: card.brand,
      cardLast4: card.last4,
      cardExp: card.exp,
    })
    .returning();
  return created;
}

export async function getCheckoutSessionByToken(token: string) {
  await ensureStripeSeed();
  const [session] = await db
    .select()
    .from(stripeCheckoutSessions)
    .where(eq(stripeCheckoutSessions.token, token));
  if (!session) return null;
  const [product] = await db
    .select()
    .from(stripeProducts)
    .where(eq(stripeProducts.id, session.productId));
  return { session, product };
}

export async function simulateWebhook(kind: string) {
  await assertStripeConnected();
  if (kind === "invoice.paid") {
    const [open] = await db
      .select()
      .from(stripeInvoices)
      .where(eq(stripeInvoices.status, "open"));
    if (!open) throw new Error("No open invoice to pay.");
    return markInvoicePaid(open.id);
  }
  if (kind === "invoice.payment_failed") {
    const [open] = await db
      .select()
      .from(stripeInvoices)
      .where(and(eq(stripeInvoices.status, "open")));
    if (!open) throw new Error("No open invoice to fail.");
    return markInvoiceFailed(open.id);
  }
  if (kind === "charge.refunded") {
    const [paid] = await db
      .select()
      .from(stripeInvoices)
      .where(eq(stripeInvoices.status, "paid"));
    if (!paid) throw new Error("No paid invoice to refund.");
    return refundInvoice(paid.id);
  }
  throw new Error("Unsupported webhook simulation.");
}

export function subscriptionMonthlyValue(
  subscription: { quantity: number },
  product?: { price: string; interval: string },
) {
  if (!product) return 0;
  const price = Number(product.price);
  if (product.interval === "year") return (price * subscription.quantity) / 12;
  if (product.interval === "one_time") return 0;
  return price * subscription.quantity;
}

// legacy exports kept for the older module
export {
  createInvoice as createInvoiceLegacy,
  markInvoicePaid as markInvoicePaidLegacy,
};

export const STRIPE_DEAL_STAGES = stageMeta;
