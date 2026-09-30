import Link from "next/link";
import type { ReactNode } from "react";
import { btnGhost, btnPrimary, sectionLabel } from "@/components/brand";

function SplitSection({
  id,
  eyebrow,
  title,
  body,
  bullets,
  visual,
  reverse = false,
  tone = "light",
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  visual: ReactNode;
  reverse?: boolean;
  tone?: "light" | "muted";
}) {
  return (
    <section
      id={id}
      className={tone === "muted" ? "bg-slate-50 py-20 lg:py-24" : "bg-white py-20 lg:py-24"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`grid items-center gap-12 lg:grid-cols-2 ${
            reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div>
            <span className={sectionLabel}>{eyebrow}</span>
            <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{body}</p>
            <ul className="mt-7 space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                      <path
                        d="M5 10.5l3 3 7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[15px] leading-relaxed text-slate-700">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-800"
            >
              Try it in the live workspace
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path
                  d="M4 10h11m0 0-4-4m4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          </div>
          <div>{visual}</div>
        </div>
      </div>
    </section>
  );
}

export function ToolGrid() {
  const tools = [
    {
      name: "CRM",
      desc: "Leads, deals, quotes, invoices and telephony records in a single pipeline.",
      icon: "M4 6h16M4 12h10M4 18h7",
      tone: "from-sky-400 to-brand-500",
    },
    {
      name: "Tasks & Projects",
      desc: "Kanban, Gantt, checklists, workloads, time tracking and SLA timers.",
      icon: "M5 7l3 3 5-5M4 17h16",
      tone: "from-violet-400 to-indigo-500",
    },
    {
      name: "Contact Center",
      desc: "Calls, WhatsApp, Telegram, live chat, email and socials with full history.",
      icon: "M4 10a8 8 0 0116 0v4a3 3 0 01-3 3h-1v-7h4M4 10v4a3 3 0 003 3h1v-7H4",
      tone: "from-emerald-400 to-teal-500",
    },
    {
      name: "Sites & Stores",
      desc: "Drag-and-drop builder, CRM webforms, online payments, product catalog.",
      icon: "M4 5h16v10H4zM8 19h8",
      tone: "from-amber-400 to-orange-500",
    },
    {
      name: "Automation & AI",
      desc: "No-code triggers, sales scripts and an AI assistant that drafts follow-ups.",
      icon: "M12 4v4m0 8v4M4 12h4m8 0h4M9 9h6v6H9z",
      tone: "from-coral-400 to-rose-500",
    },
    {
      name: "BI & Reports",
      desc: "40+ dashboards, custom SQL reports, forecast accuracy and cohort views.",
      icon: "M5 18V9m5 9V5m5 13v-6m5 6v-3",
      tone: "from-brand-400 to-brand-600",
    },
  ];

  return (
    <section id="tools" className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className={sectionLabel}>One platform, six engines</span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
            Everything your team needs to grow revenue
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            NexagrowthCRM replaces the patchwork of a CRM, a project tool, a
            helpdesk, a website builder and a BI product.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-card"
            >
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tool.tone} text-white`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <path
                    d={tool.icon}
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-bold text-brand-950">{tool.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{tool.desc}</p>
              <span className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand-50 opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineVisual() {
  const rows = [
    { name: "Vertex Manufacturing PLC", value: "₦324M", stage: "Qualified", width: "92%", tone: "bg-indigo-500" },
    { name: "Fintech Hive Africa", value: "₦213M", stage: "Won", width: "78%", tone: "bg-emerald-500" },
    { name: "Sahel Logistics Group", value: "₦132M", stage: "Proposal", width: "61%", tone: "bg-amber-500" },
    { name: "Northwind Analytics NG", value: "₦81M", stage: "Negotiation", width: "45%", tone: "bg-sky-500" },
  ];
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Forecast
          </p>
          <p className="text-2xl font-extrabold text-brand-950">₦760M</p>
        </div>
        <span className="rounded-full bg-mint-400/15 px-3 py-1 text-xs font-bold text-emerald-600">
          +18.4% QoQ
        </span>
      </div>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-semibold text-brand-950">{row.name}</span>
              <span className="font-bold text-slate-500">{row.value}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${row.tone}`} style={{ width: row.width }} />
              </div>
              <span className="w-20 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {row.stage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomationVisual() {
  const rules = [
    { trigger: "Lead filled CRM form", action: "Create deal + assign to SDR", delay: "instant" },
    { trigger: "No reply in 48h", action: "Send WhatsApp nudge from template", delay: "after 2d" },
    { trigger: "Deal moved to Proposal", action: "Generate quote PDF + request approval", delay: "instant" },
    { trigger: "Invoice paid", action: "Start onboarding project + notify #cs", delay: "instant" },
  ];
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-brand-950 p-6 text-white shadow-soft">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">
        Automation designer
      </p>
      <div className="mt-4 space-y-3">
        {rules.map((rule, index) => (
          <div
            key={rule.trigger}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-aqua-400 text-xs font-bold text-brand-950">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                WHEN <span className="text-aqua-400">{rule.trigger}</span>
              </p>
              <p className="text-sm text-white/70">THEN {rule.action}</p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-white/35">
                {rule.delay}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactCenterVisual() {
  const channels = [
    "Telephony",
    "WhatsApp",
    "Telegram",
    "Live chat",
    "Email",
    "Instagram",
    "Facebook",
    "Web forms",
    "SMS",
    "X",
  ];
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-mint-400 to-emerald-500 text-sm font-bold text-white">
          DV
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-brand-950">Damilola Whitmore</p>
          <p className="text-xs text-slate-500">Sunrise Retail Lagos · WhatsApp</p>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
          Live
        </span>
      </div>
      <div className="space-y-2.5 text-sm">
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-slate-700">
          Hi! Can we get the storefront plus WhatsApp on one account?
        </p>
        <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-500 px-4 py-2.5 text-white">
          Absolutely — I opened your trial and pre-configured both channels.
        </p>
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2.5 text-slate-700">
          Perfect. Can you send a quote?
        </p>
        <div className="ml-auto max-w-[85%] rounded-2xl bg-brand-50 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
            Quote #4218 auto-created
          </p>
          <p className="text-sm font-semibold text-brand-950">₦14.4M · 25 seats</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {channels.map((channel) => (
          <span
            key={channel}
            className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600"
          >
            {channel}
          </span>
        ))}
      </div>
    </div>
  );
}

function BiVisual() {
  const bars = [42, 58, 49, 71, 66, 84, 92];
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Revenue by month
          </p>
          <p className="text-2xl font-extrabold text-brand-950">₦2.1B</p>
        </div>
        <div className="flex gap-1.5">
          {["30d", "QTD", "YTD"].map((range, index) => (
            <span
              key={range}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                index === 2
                  ? "bg-brand-500 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {range}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6 flex h-40 items-end gap-3">
        {bars.map((bar, index) => (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="animate-bar w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-aqua-400"
              style={{ height: `${bar}%`, animationDelay: `${index * 70}ms` }}
            />
            <span className="text-[10px] font-semibold text-slate-400">
              {["Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SiteVisual() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-coral-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-sun-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-mint-400" />
        <span className="ml-3 truncate rounded-md bg-white px-2 py-1 text-[11px] text-slate-500">
          demo.nexagrowthcrm.com/landing
        </span>
      </div>
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/3 rounded-full bg-brand-100" />
        <div className="h-6 w-4/5 rounded-lg bg-brand-950" />
        <div className="h-3 w-2/3 rounded-full bg-slate-200" />
        <div className="grid grid-cols-3 gap-3 pt-3">
          {["Hero", "Pricing", "CRM form"].map((block) => (
            <div
              key={block}
              className="rounded-xl border border-dashed border-brand-300 bg-brand-50/60 p-4 text-center text-[11px] font-bold uppercase tracking-wide text-brand-600"
            >
              {block}
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Form → CRM
          </p>
          <div className="mt-3 space-y-2">
            <div className="h-8 rounded-lg bg-slate-100" />
            <div className="h-8 rounded-lg bg-slate-100" />
            <div className="h-9 w-32 rounded-lg bg-aqua-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureSplits() {
  return (
    <>
      <SplitSection
        id="sales-intelligence"
        eyebrow="CRM & Sales"
        title="A pipeline your reps actually enjoy using"
        body="Move deals with drag and drop, see every call, email and payment in the deal timeline, and let sales scripts tell each rep exactly what to do next."
        bullets={[
          "Unlimited deals, contacts and companies on every plan",
          "Drag-and-drop Kanban, list and calendar views with saved filters",
          "Automatic deal scoring, duplicate detection and stale-deal alerts",
          "Quotes, invoices and e-signature generated inside the deal",
        ]}
        visual={<PipelineVisual />}
      />
      <SplitSection
        id="automation"
        eyebrow="Automation & AI"
        tone="muted"
        reverse
        title="Automate the busywork, keep the judgement"
        body="Design multi-step workflows without a developer. Triggers fire on forms, calls, stage changes, payments or any custom field you add."
        bullets={[
          "400+ ready triggers, actions and conditions",
          "AI assistant drafts replies, summarises calls and scores leads",
          "Role-based approvals for discounts, refunds and quotes",
          "SLA timers with escalation to a manager's phone",
        ]}
        visual={<AutomationVisual />}
      />
      <SplitSection
        id="contact-center"
        eyebrow="Contact Center"
        title="Every conversation, one timeline"
        body="Plug in your phone number and messaging channels in minutes. NexagrowthCRM records, transcribes and links every conversation to the right deal."
        bullets={[
          "Click-to-call with call recording and AI transcription",
          "WhatsApp, Telegram, live chat, socials and email in one inbox",
          "Automatic lead capture from web forms and missed calls",
          "Queue routing, working hours and satisfaction ratings",
        ]}
        visual={<ContactCenterVisual />}
      />
      <SplitSection
        id="sites"
        eyebrow="Sites & Stores"
        tone="muted"
        reverse
        title="Landing pages that feed your pipeline directly"
        body="Publish a page, attach a CRM form and every submission becomes a scored lead with a task for the owner. Add a store and take payments without extra tooling."
        bullets={[
          "200+ blocks, free hosting and free SSL on every plan",
          "CRM webforms, quizzes and callback widgets",
          "Online store with catalog, carts and payment gateways",
          "A/B testing and built-in UTM attribution",
        ]}
        visual={<SiteVisual />}
      />
      <SplitSection
        id="marketing"
        eyebrow="Marketing"
        title="Campaigns measured down to closed revenue"
        body="Build segments, send emails and SMS, then see which campaign produced the deals that actually closed — not just the clicks."
        bullets={[
          "Visual segmentation with behavioural and CRM filters",
          "Drip campaigns, win-back flows and lead nurturing",
          "Multi-touch attribution across ads, channels and reps",
          "Ad retargeting audiences synced from CRM segments",
        ]}
        visual={<BiVisual />}
      />
      <SplitSection
        id="hr"
        eyebrow="Work & HR"
        tone="muted"
        reverse
        title="Your company structure, workload and time off"
        body="Onboard staff, assign departments, track absence and balance workloads — all inside the same workspace your sales team already uses."
        bullets={[
          "Org chart with departments, roles and permissions",
          "Work reports, meetings, announcements and video calls",
          "Absence management and time tracking with timesheets",
          "Employee efficiency reports per department",
        ]}
        visual={<PipelineVisual />}
      />
    </>
  );
}

export function Metrics() {
  const stats = [
    { value: "12,400+", label: "companies run on NexagrowthCRM" },
    { value: "38%", label: "average lift in win rate in 6 months" },
    { value: "9h", label: "saved per rep every week" },
    { value: "99.98%", label: "platform uptime last 12 months" },
  ];
  return (
    <section id="metrics" className="bg-brand-950 py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <p className="gradient-text text-4xl font-extrabold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/65">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Integrations() {
  const apps = [
    "Slack",
    "Google Workspace",
    "Microsoft 365",
    "Shopify",
    "Stripe",
    "Zapier",
    "HubSpot import",
    "Mailchimp",
    "QuickBooks",
    "Zoom",
    "Twilio",
    "Notion",
    "Salesforce import",
    "Intercom",
    "Calendly",
    "Xero",
  ];
  return (
    <section id="integrations" className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <span className={sectionLabel}>Integrations</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
              Connect your stack in an afternoon
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              1,200+ marketplace apps, an open REST API, webhooks and CSV import.
              Migrate from any CRM with our free assisted migration.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/integrations" className={btnPrimary}>
                Explore integrations
              </Link>
              <Link href="/app/crm/integrations" className={btnGhost}>
                Open live marketplace
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {apps.map((app) => (
              <div
                key={app}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-4 text-center text-xs font-bold text-slate-600 transition hover:border-brand-200 hover:bg-white hover:text-brand-600"
              >
                {app}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const quotes = [
    {
      quote:
        "We replaced three subscriptions with NexagrowthCRM and cut our tooling bill by 61%. The automation designer alone gave each rep back a full day per week.",
      name: "Elena Vargas",
      role: "VP Revenue Operations, Northwind Analytics Nigeria",
      initials: "EV",
      tone: "from-brand-400 to-brand-600",
    },
    {
      quote:
        "Quote approvals used to take four days over email. Now the workflow routes, reminds and archives everything inside the deal. Cycle time dropped 12 days.",
      name: "Marcus Reinhardt",
      role: "Procurement & Sales Ops, Vertex Manufacturing PLC",
      initials: "MR",
      tone: "from-violet-400 to-indigo-500",
    },
    {
      quote:
        "The WhatsApp channel plus CRM forms means nothing slips through. Our clinics see 40% fewer no-shows because reminders go out automatically.",
      name: "Grace Okoro",
      role: "Clinic Director, Lumen Dental",
      initials: "GO",
      tone: "from-emerald-400 to-teal-500",
    },
  ];
  return (
    <section id="testimonials" className="bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className={sectionLabel}>Customer stories</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
            Teams that moved to one workspace
          </h2>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {quotes.map((item) => (
            <figure
              key={item.name}
              className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-card"
            >
              <div className="mb-4 flex gap-1 text-sun-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg key={index} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                    <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L1.6 7.7l5.8-.8z" />
                  </svg>
                ))}
              </div>
              <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${item.tone} text-sm font-bold text-white`}
                >
                  {item.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-brand-950">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 via-brand-500 to-aqua-500 px-8 py-14 text-center text-white sm:px-14">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-brand-950/25 blur-3xl" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              Start free. Keep the data. Pay only when you scale.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/85">
              14-day trial of every feature, no card required. Free plan for up
              to 5 users forever.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-700 transition hover:bg-brand-950 hover:text-white"
              >
                Create my workspace
              </Link>
              <Link
                href="/app/crm"
                className="rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
              >
                Explore the demo CRM
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
