"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { money } from "@/lib/types";

type Product = {
  id: number;
  name: string;
  interval: string;
  price: string;
  active: boolean;
};

type Customer = {
  id: number;
  name: string;
  email: string | null;
  cardBrand: string;
  cardLast4: string;
  cardExp: string;
  contactId: number | null;
};

type Subscription = {
  id: number;
  customerId: number;
  productId: number;
  dealId: number | null;
  quantity: number;
  status: string;
  currentPeriodEnd: string;
};

type Invoice = {
  id: number;
  number: string;
  dealId: number | null;
  customerId: number | null;
  customerName: string;
  customerEmail: string | null;
  amount: string;
  status: string;
  dueDate: string | null;
  paymentMethod: string;
  memo: string | null;
  createdAt: string;
  paidAt: string | null;
};

type Session = {
  id: number;
  token: string;
  productId: number;
  dealId: number | null;
  amount: string;
  status: string;
  customerEmail: string | null;
  createdAt: string;
};

type Event = {
  id: number;
  type: string;
  summary: string;
  amount: string | null;
  createdAt: string;
};

type DealOption = { id: number; title: string; amount?: string; stage?: string };

type StripeData = {
  mode: string;
  currency: string;
  products: Product[];
  customers: Customer[];
  subscriptions: Subscription[];
  invoices: Invoice[];
  sessions: Session[];
  events: Event[];
  deals: DealOption[];
  stats: {
    monthlyMrr: number;
    arr: number;
    activeSubscriptions: number;
    pastDueSubscriptions: number;
    collected: number;
    outstanding: number;
    customerCount: number;
  };
};

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

const LABEL =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const STATUS_TONE: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  open: "bg-sky-100 text-sky-700",
  past_due: "bg-amber-100 text-amber-700",
  refunded: "bg-rose-100 text-rose-700",
  void: "bg-slate-100 text-slate-600",
  active: "bg-emerald-100 text-emerald-700",
  canceled: "bg-slate-100 text-slate-500",
  completed: "bg-emerald-100 text-emerald-700",
};

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

function shortDay(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StripeWorkspace() {
  const [data, setData] = useState<StripeData | null>(null);
  const [tab, setTab] = useState<
    "overview" | "invoices" | "subscriptions" | "products" | "customers" | "checkout" | "webhooks"
  >("overview");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/channels/stripe", { cache: "no-store" });
      const payload = (await response.json()) as { data?: StripeData; error?: string };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? "Could not load Stripe.");
        return;
      }
      setData(payload.data);
      setError("");
    } catch {
      setError("Network error.");
    }
  }, []);

  useEffect(() => {
    void load();
    setOrigin(window.location.origin);
  }, [load]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/channels/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const payload = (await response.json()) as {
        data?: StripeData;
        error?: string;
        message?: string;
      };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? "Request failed");
        return false;
      }
      setData(payload.data);
      setNotice(payload.message ?? "Saved");
      return true;
    } catch {
      setError("Network error.");
      return false;
    } finally {
      setBusy("");
    }
  }

  const productById = useMemo(
    () => new Map((data?.products ?? []).map((product) => [product.id, product])),
    [data?.products],
  );
  const customerById = useMemo(
    () => new Map((data?.customers ?? []).map((customer) => [customer.id, customer])),
    [data?.customers],
  );
  const dealById = useMemo(
    () => new Map((data?.deals ?? []).map((deal) => [deal.id, deal])),
    [data?.deals],
  );

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/crm/integrations" className="text-sm font-semibold text-brand-600">
          ← Marketplace
        </Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-violet-700">
            {data ? `${data.mode} mode` : "test mode"}
          </span>
          <Link
            href="/app/crm/deals"
            className="text-sm font-semibold text-slate-500 hover:text-brand-600"
          >
            Open pipeline
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
            Payments · Stripe
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Payments desk
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Invoices, subscriptions, checkout links and webhook events. Paying an
            invoice closes the linked deal as won and fires your outbound webhooks.
          </p>
        </div>
      </div>

      {data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Monthly recurring",
              value: money(data.stats.monthlyMrr, true),
              hint: `ARR ${money(data.stats.arr, true)}`,
              tone: "from-violet-500 to-indigo-500",
            },
            {
              label: "Active subscriptions",
              value: String(data.stats.activeSubscriptions),
              hint: `${data.stats.pastDueSubscriptions} past due`,
              tone: "from-emerald-500 to-teal-500",
            },
            {
              label: "Collected",
              value: money(data.stats.collected, true),
              hint: `${data.invoices.filter((i) => i.status === "paid").length} paid invoices`,
              tone: "from-brand-500 to-aqua-500",
            },
            {
              label: "Outstanding",
              value: money(data.stats.outstanding, true),
              hint: `${data.invoices.filter((i) => i.status === "open" || i.status === "past_due").length} unpaid`,
              tone: "from-amber-500 to-orange-500",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.tone}`}
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-extrabold text-brand-950">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["overview", "Overview"],
            ["invoices", "Invoices"],
            ["subscriptions", "Subscriptions"],
            ["products", "Products"],
            ["customers", "Customers"],
            ["checkout", "Checkout links"],
            ["webhooks", "Events & webhooks"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              tab === key
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </p>
      )}

      {!data && (
        <div className="mt-6 h-64 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      )}

      {data && tab === "overview" && (
        <OverviewTab
          data={data}
          productById={productById}
          customerById={customerById}
          dealById={dealById}
        />
      )}

      {data && tab === "invoices" && (
        <InvoicesTab data={data} busy={busy} onAct={act} />
      )}

      {data && tab === "subscriptions" && (
        <SubscriptionsTab
          data={data}
          busy={busy}
          onAct={act}
          productById={productById}
          customerById={customerById}
        />
      )}

      {data && tab === "products" && (
        <ProductsTab data={data} busy={busy} onAct={act} />
      )}

      {data && tab === "customers" && (
        <CustomersTab data={data} customerById={customerById} />
      )}

      {data && tab === "checkout" && (
        <CheckoutTab
          data={data}
          busy={busy}
          onAct={act}
          origin={origin}
          productById={productById}
        />
      )}

      {data && tab === "webhooks" && (
        <WebhooksTab data={data} busy={busy} onAct={act} />
      )}
    </div>
  );
}

function OverviewTab({
  data,
  productById,
  customerById,
  dealById,
}: {
  data: StripeData;
  productById: Map<number, Product>;
  customerById: Map<number, Customer>;
  dealById: Map<number, DealOption>;
}) {
  const topSubs = data.subscriptions.slice(0, 5);
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-950">Latest invoices</h2>
          <span className="text-xs text-slate-400">
            Showing {Math.min(6, data.invoices.length)} of {data.invoices.length}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {data.invoices.slice(0, 6).map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="font-bold text-brand-950">{invoice.number}</p>
                <p className="text-xs text-slate-500">
                  {invoice.customerName}
                  {invoice.dealId && dealById.get(invoice.dealId)
                    ? ` · ${dealById.get(invoice.dealId)?.title}`
                    : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-brand-950">{money(invoice.amount)}</p>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    STATUS_TONE[invoice.status] ?? "bg-slate-100 text-slate-500"
                  }`}
                >
                  {invoice.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
          {data.invoices.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
              No invoices yet. Create one from the Invoices tab.
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-brand-950">Top subscriptions</h2>
          <ul className="mt-4 space-y-3">
            {topSubs.map((subscription) => {
              const product = productById.get(subscription.productId);
              const customer = customerById.get(subscription.customerId);
              const monthly = product
                ? product.interval === "year"
                  ? (Number(product.price) * subscription.quantity) / 12
                  : product.interval === "one_time"
                    ? 0
                    : Number(product.price) * subscription.quantity
                : 0;
              return (
                <li
                  key={subscription.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-brand-950">
                      {customer?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product?.name ?? "Product"} × {subscription.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-brand-950">
                      {money(monthly, true)}
                      <span className="ml-1 text-[11px] font-semibold text-slate-500">
                        / mo
                      </span>
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        STATUS_TONE[subscription.status] ?? "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </div>
                </li>
              );
            })}
            {topSubs.length === 0 && (
              <li className="text-sm text-slate-400">No subscriptions yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-brand-950 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-400">
            Try the loop
          </p>
          <h2 className="mt-2 text-lg font-extrabold">Simulate a Stripe webhook</h2>
          <p className="mt-2 text-sm text-white/70">
            Use the Events tab to fire <code>invoice.paid</code>,{" "}
            <code>invoice.payment_failed</code>, or <code>charge.refunded</code>. The
            deal moves automatically and every outbound webhook subscriber gets called.
          </p>
        </div>
      </div>
    </div>
  );
}

function InvoicesTab({
  data,
  busy,
  onAct,
}: {
  data: StripeData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    dealId: String(data.deals[0]?.id ?? ""),
    customerId: String(data.customers[0]?.id ?? ""),
    amount: "",
    memo: "",
    dueDate: "",
    paymentMethod: "card",
  });

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <p className="font-bold text-brand-950">{invoice.number}</p>
                    <p className="text-[11px] text-slate-400">{when(invoice.createdAt)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p className="font-semibold text-brand-950">
                      {invoice.customerName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {invoice.customerEmail ?? "no email"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-bold text-brand-950">
                    {money(invoice.amount)}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {shortDay(invoice.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        STATUS_TONE[invoice.status] ?? "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {invoice.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {invoice.status === "open" && (
                        <>
                          <button
                            type="button"
                            disabled={busy === "mark_paid"}
                            onClick={() => void onAct("mark_paid", { id: invoice.id })}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            Mark paid
                          </button>
                          <button
                            type="button"
                            onClick={() => void onAct("mark_failed", { id: invoice.id })}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                          >
                            Fail
                          </button>
                          <button
                            type="button"
                            onClick={() => void onAct("void", { id: invoice.id })}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600"
                          >
                            Void
                          </button>
                        </>
                      )}
                      {invoice.status === "past_due" && (
                        <>
                          <button
                            type="button"
                            onClick={() => void onAct("mark_paid", { id: invoice.id })}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                          >
                            Retry paid
                          </button>
                          <button
                            type="button"
                            onClick={() => void onAct("void", { id: invoice.id })}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500"
                          >
                            Void
                          </button>
                        </>
                      )}
                      {invoice.status === "paid" && (
                        <button
                          type="button"
                          onClick={() => void onAct("refund", { id: invoice.id })}
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-coral-400"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data.invoices.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No invoices yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("create_invoice", {
            dealId: form.dealId || null,
            customerId: form.customerId || null,
            amount: Number(form.amount || 0),
            memo: form.memo,
            dueDate: form.dueDate,
            paymentMethod: form.paymentMethod,
          }).then((ok) => {
            if (ok) setForm((prev) => ({ ...prev, amount: "", memo: "" }));
          });
        }}
        className="h-fit rounded-3xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-base font-extrabold text-brand-950">New invoice</h2>
        <p className="mt-1 text-xs text-slate-500">
          Ties to a deal so paying it moves the deal to Closed won.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={LABEL}>Deal</span>
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
          </label>
          <label className="block">
            <span className={LABEL}>Customer</span>
            <select
              className={FIELD}
              value={form.customerId}
              onChange={(event) => setForm((prev) => ({ ...prev, customerId: event.target.value }))}
            >
              <option value="">Use deal contact</option>
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Amount (₦)</span>
            <input
              type="number"
              min="0"
              step="1"
              className={FIELD}
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="Uses the deal amount if left blank"
            />
          </label>
          <label className="block">
            <span className={LABEL}>Due date</span>
            <input
              type="date"
              className={FIELD}
              value={form.dueDate}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className={LABEL}>Payment method</span>
            <select
              className={FIELD}
              value={form.paymentMethod}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))
              }
            >
              <option value="card">Card</option>
              <option value="ach">ACH transfer</option>
              <option value="sepa">SEPA debit</option>
              <option value="wire">Wire</option>
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Memo</span>
            <textarea
              rows={3}
              className={FIELD}
              value={form.memo}
              onChange={(event) => setForm((prev) => ({ ...prev, memo: event.target.value }))}
            />
          </label>
          <button
            type="submit"
            disabled={busy === "create_invoice"}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy === "create_invoice" ? "Sending…" : "Send invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SubscriptionsTab({
  data,
  busy,
  onAct,
  productById,
  customerById,
}: {
  data: StripeData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
  productById: Map<number, Product>;
  customerById: Map<number, Customer>;
}) {
  const [form, setForm] = useState({
    customerId: String(data.customers[0]?.id ?? ""),
    productId: String(data.products.find((product) => product.active)?.id ?? ""),
    dealId: "",
    quantity: "10",
  });

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Monthly</th>
                <th className="px-4 py-3 font-semibold">Renews</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.subscriptions.map((subscription) => {
                const product = productById.get(subscription.productId);
                const customer = customerById.get(subscription.customerId);
                const monthly = product
                  ? product.interval === "year"
                    ? (Number(product.price) * subscription.quantity) / 12
                    : product.interval === "one_time"
                      ? 0
                      : Number(product.price) * subscription.quantity
                  : 0;
                return (
                  <tr key={subscription.id}>
                    <td className="px-5 py-3">
                      <p className="font-bold text-brand-950">
                        {customer?.name ?? "Unknown"}
                      </p>
                      <p className="text-xs text-slate-400">{customer?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {product?.name ?? "Product"}
                      <p className="text-xs text-slate-400">{product?.interval}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{subscription.quantity}</td>
                    <td className="px-4 py-3 font-bold text-brand-950">
                      {money(monthly, true)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {shortDay(subscription.currentPeriodEnd)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          STATUS_TONE[subscription.status] ?? "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {subscription.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {subscription.status !== "canceled" && (
                        <button
                          type="button"
                          onClick={() =>
                            void onAct("cancel_subscription", { id: subscription.id })
                          }
                          className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-coral-400"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {data.subscriptions.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    No subscriptions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("create_subscription", {
            customerId: Number(form.customerId),
            productId: Number(form.productId),
            dealId: form.dealId || null,
            quantity: Number(form.quantity || 1),
          });
        }}
        className="h-fit rounded-3xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-base font-extrabold text-brand-950">Start subscription</h2>
        <p className="mt-1 text-xs text-slate-500">
          Bills the customer immediately and creates the first invoice.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={LABEL}>Customer</span>
            <select
              required
              className={FIELD}
              value={form.customerId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, customerId: event.target.value }))
              }
            >
              {data.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Product</span>
            <select
              required
              className={FIELD}
              value={form.productId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, productId: event.target.value }))
              }
            >
              {data.products
                .filter((product) => product.active)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · {money(product.price)} / {product.interval}
                  </option>
                ))}
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Deal</span>
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
          </label>
          <label className="block">
            <span className={LABEL}>Quantity</span>
            <input
              type="number"
              min="1"
              className={FIELD}
              value={form.quantity}
              onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
            />
          </label>
          <button
            type="submit"
            disabled={busy === "create_subscription"}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            Start subscription
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductsTab({
  data,
  busy,
  onAct,
}: {
  data: StripeData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  const [form, setForm] = useState({
    name: "",
    interval: "month",
    price: "",
  });
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="grid gap-4 sm:grid-cols-2">
        {data.products.map((product) => (
          <article
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-brand-950">{product.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  product.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}
              >
                {product.active ? "Active" : "Archived"}
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-brand-950">
              {money(product.price)}
              <span className="ml-1 text-xs font-semibold text-slate-500">
                / {product.interval}
              </span>
            </p>
            <button
              type="button"
              onClick={() => void onAct("toggle_product", { id: product.id })}
              className="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
            >
              {product.active ? "Archive" : "Restore"}
            </button>
          </article>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("create_product", {
            name: form.name,
            interval: form.interval,
            price: Number(form.price || 0),
          }).then((ok) => {
            if (ok) setForm({ name: "", interval: "month", price: "" });
          });
        }}
        className="h-fit rounded-3xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-base font-extrabold text-brand-950">New product</h2>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={LABEL}>Name</span>
            <input
              required
              className={FIELD}
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Add-on: Advanced BI"
            />
          </label>
          <label className="block">
            <span className={LABEL}>Interval</span>
            <select
              className={FIELD}
              value={form.interval}
              onChange={(event) => setForm((prev) => ({ ...prev, interval: event.target.value }))}
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
              <option value="one_time">One time</option>
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Price (₦)</span>
            <input
              type="number"
              min="0"
              className={FIELD}
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            />
          </label>
          <button
            type="submit"
            disabled={busy === "create_product"}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white"
          >
            Save product
          </button>
        </div>
      </form>
    </div>
  );
}

function CustomersTab({
  data,
  customerById,
}: {
  data: StripeData;
  customerById: Map<number, Customer>;
}) {
  const spendByCustomer = useMemo(() => {
    const map = new Map<number, number>();
    for (const invoice of data.invoices) {
      if (invoice.status !== "paid" || !invoice.customerId) continue;
      map.set(
        invoice.customerId,
        (map.get(invoice.customerId) ?? 0) + Number(invoice.amount),
      );
    }
    return map;
  }, [data.invoices]);

  const subCountByCustomer = useMemo(() => {
    const map = new Map<number, number>();
    for (const subscription of data.subscriptions) {
      map.set(subscription.customerId, (map.get(subscription.customerId) ?? 0) + 1);
    }
    return map;
  }, [data.subscriptions]);

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-5 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Card on file</th>
            <th className="px-4 py-3 font-semibold">Subscriptions</th>
            <th className="px-4 py-3 font-semibold">Lifetime paid</th>
            <th className="px-5 py-3 font-semibold">CRM contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-5 py-3">
                <p className="font-bold text-brand-950">{customer.name}</p>
                <p className="text-xs text-slate-400">{customer.email ?? "no email"}</p>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">
                  {customer.cardBrand}
                </span>
                <span className="ml-2 font-mono">•••• {customer.cardLast4}</span>
                <span className="ml-2 text-xs text-slate-400">exp {customer.cardExp}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">
                {subCountByCustomer.get(customer.id) ?? 0}
              </td>
              <td className="px-4 py-3 font-bold text-brand-950">
                {money(spendByCustomer.get(customer.id) ?? 0)}
              </td>
              <td className="px-5 py-3">
                {customer.contactId ? (
                  <Link
                    href={`/app/crm/contacts?q=${encodeURIComponent(customer.name)}`}
                    className="text-xs font-bold text-brand-600"
                  >
                    Open contact
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">No CRM link</span>
                )}
              </td>
            </tr>
          ))}
          {data.customers.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                No customers yet. Create a subscription or invoice.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {customerById.size === 0 && null}
    </div>
  );
}

function CheckoutTab({
  data,
  busy,
  onAct,
  origin,
  productById,
}: {
  data: StripeData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
  origin: string;
  productById: Map<number, Product>;
}) {
  const [form, setForm] = useState({
    productId: String(data.products.find((product) => product.active)?.id ?? ""),
    dealId: "",
    email: "",
  });
  const [copied, setCopied] = useState<number | null>(null);

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {data.sessions.map((session) => {
          const product = productById.get(session.productId);
          const url = `${origin}/pay/${session.token}`;
          return (
            <article
              key={session.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-950">
                    {product?.name ?? "Checkout"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {money(session.amount)} · created {when(session.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    STATUS_TONE[session.status] ?? "bg-slate-100 text-slate-500"
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <p className="mt-3 break-all rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {url}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(url).then(() => {
                      setCopied(session.id);
                      setTimeout(() => setCopied(null), 1600);
                    });
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                >
                  {copied === session.id ? "Copied" : "Copy link"}
                </button>
                <Link
                  href={`/pay/${session.token}`}
                  target="_blank"
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white"
                >
                  Open checkout
                </Link>
              </div>
            </article>
          );
        })}
        {data.sessions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No checkout links yet. Create one to send to a lead.
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onAct("create_checkout", {
            productId: Number(form.productId),
            dealId: form.dealId || null,
            email: form.email,
          }).then((ok) => {
            if (ok) setForm((prev) => ({ ...prev, email: "" }));
          });
        }}
        className="h-fit rounded-3xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-base font-extrabold text-brand-950">New checkout link</h2>
        <p className="mt-1 text-xs text-slate-500">
          Sends the customer to a hosted payment page. Completion fires the deal.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className={LABEL}>Product</span>
            <select
              required
              className={FIELD}
              value={form.productId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, productId: event.target.value }))
              }
            >
              {data.products
                .filter((product) => product.active)
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} · {money(product.price)}
                  </option>
                ))}
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Deal</span>
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
          </label>
          <label className="block">
            <span className={LABEL}>Prefill email</span>
            <input
              type="email"
              className={FIELD}
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="buyer@company.com"
            />
          </label>
          <button
            type="submit"
            disabled={busy === "create_checkout"}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white"
          >
            Generate link
          </button>
        </div>
      </form>
    </div>
  );
}

function WebhooksTab({
  data,
  busy,
  onAct,
}: {
  data: StripeData;
  busy: string;
  onAct: (action: string, extra?: Record<string, unknown>) => Promise<boolean>;
}) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-brand-950">Event log</h2>
          <p className="text-xs text-slate-500">
            Latest Stripe events for this workspace. Fanned out to your outbound webhooks.
          </p>
        </div>
        <ul className="divide-y divide-slate-100">
          {data.events.map((event) => (
            <li key={event.id} className="flex items-start gap-3 px-6 py-4">
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-brand-950">{event.summary}</p>
                <p className="mt-1 text-[11px] font-mono uppercase text-slate-400">
                  {event.type} · {when(event.createdAt)}
                </p>
              </div>
              {event.amount && (
                <p className="text-sm font-bold text-brand-950">
                  {money(event.amount)}
                </p>
              )}
            </li>
          ))}
          {data.events.length === 0 && (
            <li className="px-6 py-10 text-center text-sm text-slate-500">
              No events yet. Simulate one from the right.
            </li>
          )}
        </ul>
      </div>

      <div className="h-fit space-y-3 rounded-3xl border border-slate-200 bg-brand-950 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-400">
          Simulator
        </p>
        <h2 className="text-lg font-extrabold">Replay a Stripe event</h2>
        <p className="text-sm text-white/70">
          Runs against real records in the database, updates the linked deal, and
          triggers your outbound webhooks.
        </p>
        <div className="mt-2 space-y-2">
          {[
            { key: "invoice.paid", label: "invoice.paid" },
            { key: "invoice.payment_failed", label: "invoice.payment_failed" },
            { key: "charge.refunded", label: "charge.refunded" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              disabled={busy === "simulate"}
              onClick={() => void onAct("simulate", { kind: option.key })}
              className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/15"
            >
              <span>{option.label}</span>
              <span className="text-xs text-aqua-400">Run</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
