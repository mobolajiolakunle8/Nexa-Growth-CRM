import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  ownerUid: varchar("owner_uid", { length: 128 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id"),
  name: varchar("name", { length: 180 }).notNull(),
  industry: varchar("industry", { length: 120 }).notNull().default("Other"),
  website: varchar("website", { length: 200 }),
  phone: varchar("phone", { length: 60 }),
  email: varchar("email", { length: 180 }),
  address: varchar("address", { length: 240 }),
  employees: varchar("employees", { length: 40 }).default("11-50"),
  annualRevenue: numeric("annual_revenue", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  owner: varchar("owner", { length: 120 }).notNull().default("Unassigned"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id"),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull().default(""),
  email: varchar("email", { length: 180 }),
  phone: varchar("phone", { length: 60 }),
  position: varchar("position", { length: 140 }),
  companyId: integer("company_id"),
  source: varchar("source", { length: 80 }).notNull().default("Website"),
  stage: varchar("stage", { length: 40 }).notNull().default("lead"),
  owner: varchar("owner", { length: 120 }).notNull().default("Unassigned"),
  tags: varchar("tags", { length: 240 }).default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastTouchedAt: timestamp("last_touched_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id"),
  title: varchar("title", { length: 200 }).notNull(),
  contactId: integer("contact_id"),
  companyId: integer("company_id"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 8 }).notNull().default("NGN"),
  stage: varchar("stage", { length: 40 }).notNull().default("new"),
  probability: integer("probability").notNull().default(20),
  owner: varchar("owner", { length: 120 }).notNull().default("Unassigned"),
  source: varchar("source", { length: 80 }).notNull().default("Website"),
  expectedCloseDate: date("expected_close_date"),
  notes: text("notes"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id"),
  type: varchar("type", { length: 30 }).notNull().default("call"),
  subject: varchar("subject", { length: 220 }).notNull(),
  body: text("body"),
  dealId: integer("deal_id"),
  contactId: integer("contact_id"),
  owner: varchar("owner", { length: 120 }).notNull().default("System"),
  outcome: varchar("outcome", { length: 60 }).notNull().default("neutral"),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  workspaceId: integer("workspace_id"),
  title: varchar("title", { length: 220 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 30 }).notNull().default("todo"),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  assignee: varchar("assignee", { length: 120 }).notNull().default("Unassigned"),
  dealId: integer("deal_id"),
  contactId: integer("contact_id"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const trialRequests = pgTable("trial_requests", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  company: varchar("company", { length: 180 }),
  phone: varchar("phone", { length: 60 }),
  teamSize: varchar("team_size", { length: 40 }),
  plan: varchar("plan", { length: 60 }).notNull().default("professional"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 180 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const appUsers = pgTable("app_users", {
  id: serial("id").primaryKey(),
  uid: varchar("uid", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 180 }),
  displayName: varchar("display_name", { length: 180 }),
  photoUrl: varchar("photo_url", { length: 500 }),
  passwordHash: text("password_hash"),
  provider: varchar("provider", { length: 40 }).notNull().default("password"),
  role: varchar("role", { length: 30 }).notNull().default("owner"),
  workspaceId: integer("workspace_id"),
  company: varchar("company", { length: 180 }),
  phone: varchar("phone", { length: 60 }),
  plan: varchar("plan", { length: 40 }).notNull().default("workspace"),
  emailVerified: boolean("email_verified").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const integrationConnections = pgTable("integration_connections", {
  id: serial("id").primaryKey(),
  appKey: varchar("app_key", { length: 60 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("connected"),
  config: text("config"),
  connectedBy: varchar("connected_by", { length: 120 }).notNull().default("Amara Okafor"),
  connectedAt: timestamp("connected_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const webhookEndpoints = pgTable("webhook_endpoints", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  events: varchar("events", { length: 400 }).notNull(),
  secret: varchar("secret", { length: 80 }).notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: serial("id").primaryKey(),
  endpointId: integer("endpoint_id"),
  endpointName: varchar("endpoint_name", { length: 160 }),
  event: varchar("event", { length: 80 }).notNull(),
  payload: text("payload"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  responseCode: integer("response_code"),
  responseBody: text("response_body"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiTokens = pgTable("api_tokens", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  token: varchar("token", { length: 96 }).notNull().unique(),
  scopes: varchar("scopes", { length: 240 }).notNull().default("crm:read,crm:write"),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const slackMessages = pgTable("slack_messages", {
  id: serial("id").primaryKey(),
  channel: varchar("channel", { length: 80 }).notNull().default("#revenue-alerts"),
  author: varchar("author", { length: 120 }).notNull().default("NexagrowthCRM"),
  body: text("body").notNull(),
  dealId: integer("deal_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 60 }).notNull(),
  contactName: varchar("contact_name", { length: 160 }).notNull(),
  direction: varchar("direction", { length: 10 }).notNull().default("in"),
  body: text("body").notNull(),
  contactId: integer("contact_id"),
  dealId: integer("deal_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stripeInvoices = pgTable("stripe_invoices", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 40 }).notNull(),
  dealId: integer("deal_id"),
  customerId: integer("customer_id"),
  customerName: varchar("customer_name", { length: 180 }).notNull(),
  customerEmail: varchar("customer_email", { length: 180 }),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  dueDate: date("due_date"),
  paymentMethod: varchar("payment_method", { length: 40 })
    .notNull()
    .default("card"),
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const stripeCustomers = pgTable("stripe_customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 180 }),
  contactId: integer("contact_id"),
  cardBrand: varchar("card_brand", { length: 20 }).notNull().default("Visa"),
  cardLast4: varchar("card_last4", { length: 4 }).notNull().default("4242"),
  cardExp: varchar("card_exp", { length: 8 }).notNull().default("12/29"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stripeProducts = pgTable("stripe_products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  interval: varchar("interval", { length: 20 }).notNull().default("month"),
  price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
  currency: varchar("currency", { length: 6 }).notNull().default("NGN"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  dealId: integer("deal_id"),
  quantity: integer("quantity").notNull().default(1),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const stripeCheckoutSessions = pgTable("stripe_checkout_sessions", {
  id: serial("id").primaryKey(),
  token: varchar("token", { length: 60 }).notNull().unique(),
  productId: integer("product_id").notNull(),
  dealId: integer("deal_id"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).notNull().default("open"),
  customerEmail: varchar("customer_email", { length: 180 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const stripeEvents = pgTable("stripe_events", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 60 }).notNull(),
  summary: varchar("summary", { length: 240 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }),
  invoiceId: integer("invoice_id"),
  subscriptionId: integer("subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shopifyOrders = pgTable("shopify_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 40 }).notNull(),
  customerName: varchar("customer_name", { length: 180 }).notNull(),
  email: varchar("email", { length: 180 }),
  items: varchar("items", { length: 280 }).notNull().default(""),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 20 }).notNull().default("unfulfilled"),
  contactId: integer("contact_id"),
  dealId: integer("deal_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const m365Items = pgTable("m365_items", {
  id: serial("id").primaryKey(),
  kind: varchar("kind", { length: 20 }).notNull().default("email"),
  subject: varchar("subject", { length: 220 }).notNull(),
  body: text("body"),
  participants: varchar("participants", { length: 240 }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  contactId: integer("contact_id"),
  dealId: integer("deal_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const inboundEvents = pgTable("inbound_events", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 80 }).notNull().default("webhook"),
  payload: text("payload"),
  dealId: integer("deal_id"),
  contactId: integer("contact_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Company = typeof companies.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type TrialRequest = typeof trialRequests.$inferSelect;
export type AppUser = typeof appUsers.$inferSelect;
