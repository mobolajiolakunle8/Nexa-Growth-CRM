"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { money } from "@/lib/types";

type AppKey = "slack" | "whatsapp" | "stripe" | "shopify" | "microsoft";

type DealOption = { id: number; title: string; amount?: string; stage?: string };

type SlackData = {
  channel: string;
  messages: { id: number; author: string; body: string; createdAt: string; dealId: number | null }[];
  deals: DealOption[];
};

type WhatsappData = {
  businessNumber: string;
  messages: {
    id: number;
    phone: string;
    contactName: string;
    direction: string;
    body: string;
    createdAt: string;
  }[];
};

type StripeData = {
  mode: string;
  invoices: {
    id: number;
    number: string;
    customerName: string;
    customerEmail: string | null;
    amount: string;
    status: string;
    createdAt: string;
    dealId: number | null;
  }[];
  deals: DealOption[];
};

type ShopifyData = {
  store: string;
  orders: {
    id: number;
    orderNumber: string;
    customerName: string;
    email: string | null;
    items: string;
    total: string;
    status: string;
    dealId: number | null;
  }[];
};

type MicrosoftData = {
  tenant: string;
  items: {
    id: number;
    kind: string;
    subject: string;
    body: string | null;
    participants: string | null;
    scheduledAt: string | null;
    dealId: number | null;
  }[];
  deals: DealOption[];
};

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

function when(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChannelWorkspace({ app }: { app: AppKey }) {
  const [data, setData] = useState<
    SlackData | WhatsappData | StripeData | ShopifyData | MicrosoftData | null
  >(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/channels?app=${app}`, { cache: "no-store" });
    const payload = (await response.json()) as { data?: unknown; error?: string };
    if (!response.ok || !payload.data) {
      setError(payload.error ?? "Could not load this channel.");
      return;
    }
    setData(payload.data as SlackData);
    setError("");
  }, [app]);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ app, action, ...extra }),
      });
      const payload = (await response.json()) as {
        data?: unknown;
        error?: string;
        message?: string;
      };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? "Request failed");
        return false;
      }
      setData(payload.data as SlackData);
      setNotice(payload.message ?? "Saved");
      return true;
    } catch {
      setError("Network error.");
      return false;
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/crm/integrations" className="text-sm font-semibold text-brand-600">
          ← Marketplace
        </Link>
        <Link href="/app/crm/deals" className="text-sm font-semibold text-slate-500">
          Open pipeline
        </Link>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </p>
      )}
      {!data && !error && (
        <div className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      )}
      {app === "slack" && data && (
        <SlackPanel data={data as SlackData} busy={busy} onAct={act} />
      )}
      {app === "whatsapp" && data && (
        <WhatsappPanel data={data as WhatsappData} busy={busy} onAct={act} />
      )}
      {app === "stripe" && data && (
        <StripePanel data={data as StripeData} busy={busy} onAct={act} />
      )}
      {app === "shopify" && data && (
        <ShopifyPanel data={data as ShopifyData} busy={busy} onAct={act} />
      )}
      {app === "microsoft" && data && (
        <MicrosoftPanel data={data as MicrosoftData} busy={busy} onAct={act} />
      )}
    </div>
  );
}

function SlackPanel({
  data,
  busy,
  onAct,
}: {
  data: SlackData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const [body, setBody] = useState("");
  const [dealId, setDealId] = useState("");
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#1a1d21] text-white shadow-soft">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">Slack</p>
          <h1 className="text-2xl font-extrabold">{data.channel}</h1>
        </div>
        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
          Live
        </span>
      </div>
      <div className="max-h-[560px] space-y-4 overflow-y-auto px-6 py-5">
        {data.messages.map((message) => (
          <article key={message.id} className="flex gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-bold">
              {message.author.slice(0, 1)}
            </span>
            <div>
              <p className="text-sm">
                <span className="font-bold">{message.author}</span>
                <span className="ml-2 text-xs text-white/40">{when(message.createdAt)}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed text-white/85">{message.body}</p>
            </div>
          </article>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("slack_post", {
            body,
            dealId: dealId ? Number(dealId) : null,
          }).then((ok) => {
            if (ok) setBody("");
          });
        }}
        className="border-t border-white/10 p-4"
      >
        <textarea
          required
          rows={2}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder={`Message ${data.channel}`}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-aqua-400"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={dealId}
            onChange={(event) => setDealId(event.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white"
          >
            <option value="">No linked deal</option>
            {data.deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy === "slack_post"}
            className="ml-auto rounded-xl bg-aqua-400 px-4 py-2 text-sm font-bold text-brand-950 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function WhatsappPanel({
  data,
  busy,
  onAct,
}: {
  data: WhatsappData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const threads = useMemo(() => {
    const map = new Map<string, WhatsappData["messages"]>();
    for (const message of data.messages) {
      const list = map.get(message.phone) ?? [];
      list.push(message);
      map.set(message.phone, list);
    }
    return Array.from(map.entries());
  }, [data.messages]);
  const [phone, setPhone] = useState(threads[0]?.[0] ?? "");
  const [reply, setReply] = useState("");
  const [inbound, setInbound] = useState({ name: "", phone: "", body: "" });
  const active = threads.find(([key]) => key === phone)?.[1] ?? [];
  const title = [...active].reverse().find((item) => item.direction === "in")?.contactName ?? phone;

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr_300px]">
      <aside className="rounded-3xl border border-slate-200 bg-white p-3">
        <p className="px-2 py-2 text-xs font-bold uppercase tracking-wide text-slate-400">
          {data.businessNumber}
        </p>
        {threads.map(([key, messages]) => {
          const last = messages[messages.length - 1];
          const name = [...messages].reverse().find((item) => item.direction === "in")?.contactName ?? key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setPhone(key)}
              className={`mb-1 w-full rounded-2xl px-3 py-3 text-left ${
                phone === key ? "bg-emerald-50" : "hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-bold text-brand-950">{name}</p>
              <p className="truncate text-xs text-slate-500">{last?.body}</p>
            </button>
          );
        })}
      </aside>
      <section className="flex min-h-[520px] flex-col rounded-3xl border border-emerald-100 bg-[#e7f8ef]">
        <header className="border-b border-emerald-100 bg-white px-5 py-4">
          <h1 className="text-lg font-extrabold text-brand-950">{title || "WhatsApp"}</h1>
          <p className="text-xs text-slate-500">{phone}</p>
        </header>
        <div className="flex-1 space-y-3 px-4 py-4">
          {active.map((message) => (
            <p
              key={message.id}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                message.direction === "out"
                  ? "ml-auto bg-emerald-600 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              {message.body}
              <span className="mt-1 block text-[10px] opacity-70">{when(message.createdAt)}</span>
            </p>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onAct("whatsapp_reply", { phone, body: reply }).then((ok) => {
              if (ok) setReply("");
            });
          }}
          className="flex gap-2 border-t border-emerald-100 bg-white p-3"
        >
          <input
            required
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Reply on WhatsApp"
            className={FIELD}
          />
          <button
            type="submit"
            disabled={busy === "whatsapp_reply"}
            className="rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white"
          >
            Send
          </button>
        </form>
      </section>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("whatsapp_in", inbound).then((ok) => {
            if (ok) {
              setPhone(inbound.phone);
              setInbound({ name: "", phone: "", body: "" });
            }
          });
        }}
        className="rounded-3xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-base font-extrabold text-brand-950">Simulate inbound</h2>
        <p className="mt-1 text-xs text-slate-500">
          A new number creates a contact and a deal in the pipeline.
        </p>
        <div className="mt-4 space-y-3">
          <input
            required
            className={FIELD}
            placeholder="Name"
            value={inbound.name}
            onChange={(event) => setInbound((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            required
            className={FIELD}
            placeholder="+234 802 000 0100"
            value={inbound.phone}
            onChange={(event) => setInbound((prev) => ({ ...prev, phone: event.target.value }))}
          />
          <textarea
            required
            rows={3}
            className={FIELD}
            placeholder="Message"
            value={inbound.body}
            onChange={(event) => setInbound((prev) => ({ ...prev, body: event.target.value }))}
          />
          <button
            type="submit"
            disabled={busy === "whatsapp_in"}
            className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white"
          >
            Receive message
          </button>
        </div>
      </form>
    </div>
  );
}

function StripePanel({
  data,
  busy,
  onAct,
}: {
  data: StripeData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const [dealId, setDealId] = useState(String(data.deals[0]?.id ?? ""));
  const paid = data.invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const open = data.invoices
    .filter((invoice) => invoice.status === "open")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-500">
            Stripe · {data.mode} mode
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-brand-950">Payments</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void onAct("stripe_create", { dealId: Number(dealId) });
          }}
          className="flex flex-wrap gap-2"
        >
          <select
            value={dealId}
            onChange={(event) => setDealId(event.target.value)}
            className={FIELD + " !w-auto"}
          >
            {data.deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            Create invoice
          </button>
        </form>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Collected</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{money(paid)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-slate-500">Open</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-950">{money(open)}</p>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Invoice</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-5 py-3 font-bold text-brand-950">{invoice.number}</td>
                <td className="px-4 py-3 text-slate-600">{invoice.customerName}</td>
                <td className="px-4 py-3 font-semibold">{money(invoice.amount)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-600">
                    {invoice.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {invoice.status === "open" && (
                    <button
                      type="button"
                      disabled={busy === "stripe_paid"}
                      onClick={() => void onAct("stripe_paid", { id: invoice.id })}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      Mark paid
                    </button>
                  )}
                  {invoice.status === "paid" && (
                    <button
                      type="button"
                      onClick={() => void onAct("stripe_refund", { id: invoice.id })}
                      className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-coral-400"
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ShopifyPanel({
  data,
  busy,
  onAct,
}: {
  data: ShopifyData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    customerName: "",
    email: "",
    items: "",
    total: "",
  });
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
          Shopify · {data.store}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand-950">Orders</h1>
        <div className="mt-5 space-y-3">
          {data.orders.map((order) => (
            <article
              key={order.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div>
                <p className="font-extrabold text-brand-950">
                  {order.orderNumber} · {order.customerName}
                </p>
                <p className="text-sm text-slate-500">{order.items}</p>
                <p className="text-xs text-slate-400">{order.email}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-brand-950">{money(order.total)}</p>
                <p className="text-[11px] font-bold uppercase text-slate-400">{order.status}</p>
                {order.status !== "imported" && !order.dealId ? (
                  <button
                    type="button"
                    disabled={busy === "shopify_import"}
                    onClick={() => void onAct("shopify_import", { id: order.id })}
                    className="mt-2 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Import to CRM
                  </button>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">In pipeline</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("shopify_create", {
            ...form,
            total: Number(form.total || 0),
          }).then((ok) => {
            if (ok) setForm({ customerName: "", email: "", items: "", total: "" });
          });
        }}
        className="h-fit rounded-3xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-base font-extrabold text-brand-950">New store order</h2>
        <div className="mt-4 space-y-3">
          <input
            required
            className={FIELD}
            placeholder="Customer"
            value={form.customerName}
            onChange={(event) => setForm((prev) => ({ ...prev, customerName: event.target.value }))}
          />
          <input
            type="email"
            className={FIELD}
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          />
          <input
            required
            className={FIELD}
            placeholder="Items"
            value={form.items}
            onChange={(event) => setForm((prev) => ({ ...prev, items: event.target.value }))}
          />
          <input
            type="number"
            min="0"
            className={FIELD}
            placeholder="Total"
            value={form.total}
            onChange={(event) => setForm((prev) => ({ ...prev, total: event.target.value }))}
          />
          <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white">
            Add order
          </button>
        </div>
      </form>
    </div>
  );
}

function MicrosoftPanel({
  data,
  busy,
  onAct,
}: {
  data: MicrosoftData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    kind: "email",
    subject: "",
    body: "",
    participants: "",
    scheduledAt: "",
    dealId: "",
  });
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          Microsoft 365 · {data.tenant}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand-950">Mail & calendar</h1>
        <div className="mt-5 space-y-3">
          {data.items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">
                  {item.kind}
                </span>
                <span className="text-xs text-slate-400">{when(item.scheduledAt)}</span>
              </div>
              <h2 className="mt-2 font-bold text-brand-950">{item.subject}</h2>
              <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              <p className="mt-2 text-xs text-slate-400">{item.participants}</p>
            </article>
          ))}
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("m365_create", {
            ...form,
            dealId: form.dealId ? Number(form.dealId) : null,
          }).then((ok) => {
            if (ok) {
              setForm((prev) => ({ ...prev, subject: "", body: "", participants: "" }));
            }
          });
        }}
        className="h-fit rounded-3xl border border-slate-200 bg-white p-5"
      >
        <h2 className="text-base font-extrabold text-brand-950">Log to the timeline</h2>
        <div className="mt-4 space-y-3">
          <select
            className={FIELD}
            value={form.kind}
            onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
          >
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
          </select>
          <input
            required
            className={FIELD}
            placeholder="Subject"
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
          />
          <textarea
            rows={3}
            className={FIELD}
            placeholder="Notes"
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
          />
          <input
            className={FIELD}
            placeholder="Participants"
            value={form.participants}
            onChange={(event) => setForm((prev) => ({ ...prev, participants: event.target.value }))}
          />
          <input
            type="datetime-local"
            className={FIELD}
            value={form.scheduledAt}
            onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
          />
          <select
            className={FIELD}
            value={form.dealId}
            onChange={(event) => setForm((prev) => ({ ...prev, dealId: event.target.value }))}
          >
            <option value="">No linked deal</option>
            {data.deals.map((deal) => (
              <option key={deal.id} value={deal.id}>
                {deal.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={busy === "m365_create"}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
