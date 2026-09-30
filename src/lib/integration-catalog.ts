export const ECHO_URL = "https://hooks.nexagrowthcrm.com/echo";

export const WEBHOOK_EVENTS = [
  { key: "deal.created", label: "Deal created" },
  { key: "deal.stage_changed", label: "Deal stage changed" },
  { key: "deal.updated", label: "Deal updated" },
  { key: "contact.created", label: "Contact created" },
  { key: "company.created", label: "Company created" },
  { key: "task.created", label: "Task created" },
  { key: "lead.captured", label: "Website lead captured" },
  { key: "webhook.test", label: "Test ping" },
] as const;

export type AppField = {
  key: string;
  label: string;
  placeholder: string;
};

export type CatalogApp = {
  key: string;
  name: string;
  category: string;
  blurb: string;
  tone: string;
  fields: AppField[];
};

export const APP_CATALOG: CatalogApp[] = [
  {
    key: "slack",
    name: "Slack",
    category: "Collaboration",
    blurb: "Post stage changes, won deals and overdue tasks into a sales channel.",
    tone: "from-fuchsia-500 to-brand-600",
    fields: [{ key: "channel", label: "Channel", placeholder: "#revenue-alerts" }],
  },
  {
    key: "whatsapp",
    name: "WhatsApp Business",
    category: "Channels",
    blurb: "Capture inbound chats as leads and reply from the deal timeline.",
    tone: "from-emerald-400 to-teal-600",
    fields: [{ key: "phone", label: "Business number", placeholder: "+234 802 411 0142" }],
  },
  {
    key: "telegram",
    name: "Telegram",
    category: "Channels",
    blurb: "Route bot conversations into the same omni-channel inbox.",
    tone: "from-sky-400 to-brand-600",
    fields: [{ key: "bot", label: "Bot username", placeholder: "@nexagrowth_bot" }],
  },
  {
    key: "twilio",
    name: "Twilio Voice",
    category: "Telephony",
    blurb: "Click-to-call, recordings and missed-call tasks on every deal.",
    tone: "from-rose-500 to-orange-500",
    fields: [{ key: "callerId", label: "Caller ID", placeholder: "+234 700 555 0199" }],
  },
  {
    key: "stripe",
    name: "Stripe",
    category: "Payments",
    blurb: "Mark deals won when an invoice is paid and sync refunds.",
    tone: "from-violet-500 to-indigo-600",
    fields: [{ key: "mode", label: "Mode", placeholder: "test" }],
  },
  {
    key: "shopify",
    name: "Shopify",
    category: "Commerce",
    blurb: "Turn store orders into contacts, deals and repeat-purchase tasks.",
    tone: "from-lime-500 to-emerald-600",
    fields: [{ key: "store", label: "Store domain", placeholder: "sunrise.myshopify.com" }],
  },
  {
    key: "google",
    name: "Google Workspace",
    category: "Productivity",
    blurb: "Sync calendar meetings and Gmail threads onto the contact timeline.",
    tone: "from-amber-400 to-brand-500",
    fields: [{ key: "domain", label: "Workspace domain", placeholder: "company.com" }],
  },
  {
    key: "microsoft",
    name: "Microsoft 365",
    category: "Productivity",
    blurb: "Outlook mail, Teams meetings and OneDrive quotes inside CRM.",
    tone: "from-blue-500 to-brand-700",
    fields: [{ key: "tenant", label: "Tenant", placeholder: "contoso.onmicrosoft.com" }],
  },
  {
    key: "zoom",
    name: "Zoom",
    category: "Meetings",
    blurb: "Attach meeting links and recordings to the deal automatically.",
    tone: "from-sky-500 to-blue-700",
    fields: [],
  },
  {
    key: "calendly",
    name: "Calendly",
    category: "Scheduling",
    blurb: "Booked demos create a contact, a deal and a prep task.",
    tone: "from-cyan-400 to-brand-600",
    fields: [{ key: "link", label: "Scheduling link", placeholder: "calendly.com/nexagrowth/demo" }],
  },
  {
    key: "mailchimp",
    name: "Mailchimp",
    category: "Marketing",
    blurb: "Sync lifecycle stages to audiences and measure closed revenue.",
    tone: "from-yellow-400 to-amber-600",
    fields: [{ key: "audience", label: "Audience", placeholder: "Customers" }],
  },
  {
    key: "quickbooks",
    name: "QuickBooks",
    category: "Finance",
    blurb: "Push won deals to invoices without leaving the pipeline.",
    tone: "from-green-500 to-emerald-700",
    fields: [{ key: "company", label: "Company file", placeholder: "Nexagrowth Inc." }],
  },
  {
    key: "zapier",
    name: "Zapier",
    category: "Automation",
    blurb: "Fan CRM events out to 6,000 apps using the outbound webhook.",
    tone: "from-orange-400 to-rose-500",
    fields: [],
  },
  {
    key: "salesforce",
    name: "Salesforce import",
    category: "Migration",
    blurb: "Map accounts, contacts and opportunities into NexagrowthCRM.",
    tone: "from-sky-400 to-cyan-600",
    fields: [{ key: "org", label: "Org ID", placeholder: "00Dxx0000000001" }],
  },
  {
    key: "hubspot",
    name: "HubSpot import",
    category: "Migration",
    blurb: "Bring deals, notes and owners across in one assisted import.",
    tone: "from-orange-500 to-amber-500",
    fields: [{ key: "portal", label: "Portal ID", placeholder: "12345678" }],
  },
  {
    key: "notion",
    name: "Notion",
    category: "Knowledge",
    blurb: "Publish won-deal summaries into a customer wiki.",
    tone: "from-slate-600 to-brand-900",
    fields: [{ key: "workspace", label: "Workspace", placeholder: "Revenue wiki" }],
  },
];
