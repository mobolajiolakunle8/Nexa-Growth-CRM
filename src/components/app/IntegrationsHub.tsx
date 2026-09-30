"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { APP_CATALOG, ECHO_URL, WEBHOOK_EVENTS } from "@/lib/integration-catalog";

type Connection = {
  id: number;
  appKey: string;
  status: string;
  config: string | null;
  connectedBy: string;
  connectedAt: string;
};

type Endpoint = {
  id: number;
  name: string;
  url: string;
  events: string;
  secret: string;
  active: boolean;
  createdAt: string;
};

type Delivery = {
  id: number;
  endpointName: string | null;
  event: string;
  status: string;
  responseCode: number | null;
  responseBody: string | null;
  createdAt: string;
};

type Token = {
  id: number;
  name: string;
  token: string;
  scopes: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

type Overview = {
  connections: Connection[];
  endpoints: Endpoint[];
  deliveries: Delivery[];
  tokens: Token[];
  echoes: { id: number; payload: string | null; createdAt: string }[];
};

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

const MODULE_HREF: Record<string, string> = {
  slack: "/app/crm/integrations/slack",
  whatsapp: "/app/crm/integrations/whatsapp",
  stripe: "/app/crm/integrations/stripe",
  shopify: "/app/crm/integrations/shopify",
  microsoft: "/app/crm/integrations/microsoft",
};

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-600",
  failed: "bg-rose-50 text-coral-400",
  blocked: "bg-amber-50 text-amber-700",
  pending: "bg-slate-100 text-slate-500",
};

function timeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function IntegrationsHub() {
  const [data, setData] = useState<Overview | null>(null);
  const [tab, setTab] = useState<"apps" | "webhooks" | "developers">("apps");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const [config, setConfig] = useState<Record<string, string>>({});
  const [hookForm, setHookForm] = useState({
    name: "Slack revenue channel",
    url: ECHO_URL,
    events: ["deal.created", "deal.stage_changed"],
  });
  const [tokenName, setTokenName] = useState("Marketing site");
  const [origin, setOrigin] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/integrations", { cache: "no-store" });
    const payload = (await response.json()) as { data?: Overview; error?: string };
    if (!response.ok || !payload.data) {
      setError(payload.error ?? "Could not load integrations.");
      return;
    }
    setData(payload.data);
  }, []);

  useEffect(() => {
    void load();
    setOrigin(window.location.origin);
  }, [load]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(APP_CATALOG.map((app) => app.category)))],
    [],
  );

  const connectedKeys = new Set(data?.connections.map((item) => item.appKey) ?? []);

  const visibleApps = APP_CATALOG.filter((app) => {
    const matchesCategory = category === "All" || app.category === category;
    const term = query.trim().toLowerCase();
    const matchesQuery =
      !term ||
      app.name.toLowerCase().includes(term) ||
      app.blurb.toLowerCase().includes(term);
    return matchesCategory && matchesQuery;
  });

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const payload = (await response.json()) as {
        data?: Overview;
        error?: string;
        message?: string;
      };
      if (!response.ok || !payload.data) {
        setError(payload.error ?? "Request failed");
        return;
      }
      setData(payload.data);
      setNotice(payload.message ?? "Saved");
      setConnecting(null);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy("");
    }
  }

  const activeToken = data?.tokens.find((token) => !token.revoked);

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Platform · Integrations
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Marketplace & webhooks
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Recommended setup: connect WhatsApp and Slack, subscribe an outbound
            webhook, then let your site create deals through an inbound token.
          </p>
        </div>
        <Link
          href="/integrations"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300"
        >
          Why this integration
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Connected apps",
            value: String(data?.connections.length ?? "—"),
            hint: "channels, payments, productivity",
          },
          {
            label: "Live webhooks",
            value: String(data?.endpoints.filter((item) => item.active).length ?? "—"),
            hint: "outbound event subscriptions",
          },
          {
            label: "Deliveries",
            value: String(data?.deliveries.length ?? "—"),
            hint: "latest 20 attempts",
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-brand-950">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["apps", "Marketplace"],
            ["webhooks", "Outbound webhooks"],
            ["developers", "Inbound API"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
              tab === key
                ? "bg-brand-500 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-brand-300"
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

      {tab === "apps" && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search apps"
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    category === item
                      ? "bg-brand-950 text-white"
                      : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-brand-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleApps.map((app) => {
              const connected = connectedKeys.has(app.key);
              const record = data?.connections.find((item) => item.appKey === app.key);
              let parsed: Record<string, string> = {};
              try {
                parsed = record?.config ? (JSON.parse(record.config) as Record<string, string>) : {};
              } catch {
                parsed = {};
              }
              return (
                <article
                  key={app.key}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${app.tone} text-sm font-extrabold text-white`}
                    >
                      {app.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-base font-bold text-brand-950">
                          {app.name}
                        </h2>
                        {connected && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {app.category}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {app.blurb}
                  </p>
                  {connected && Object.keys(parsed).length > 0 && (
                    <p className="mt-3 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      {Object.entries(parsed)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(" · ")}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {connected && MODULE_HREF[app.key] && (
                      <Link
                        href={MODULE_HREF[app.key]}
                        className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white"
                      >
                        Open
                      </Link>
                    )}
                    {connected ? (
                      <button
                        type="button"
                        disabled={busy === "disconnect"}
                        onClick={() => void act("disconnect", { appKey: app.key })}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 transition hover:border-coral-400/40 hover:text-coral-400"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConnecting(app.key);
                          setConfig({});
                          setError("");
                        }}
                        className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void act("create_webhook", hookForm);
            }}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-lg font-bold text-brand-950">Subscribe a webhook</h2>
            <p className="mt-1 text-sm text-slate-500">
              NexagrowthCRM POSTs JSON whenever a CRM event happens. Use the echo
              URL to watch deliveries inside this workspace.
            </p>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Name
                </span>
                <input
                  required
                  className={FIELD}
                  value={hookForm.name}
                  onChange={(event) =>
                    setHookForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Endpoint URL
                </span>
                <input
                  required
                  className={FIELD}
                  value={hookForm.url}
                  onChange={(event) =>
                    setHookForm((prev) => ({ ...prev, url: event.target.value }))
                  }
                />
              </label>
              <div>
                <span className="mb-2 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Events
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {WEBHOOK_EVENTS.filter((event) => event.key !== "webhook.test").map(
                    (event) => {
                      const checked = hookForm.events.includes(event.key);
                      return (
                        <label
                          key={event.key}
                          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setHookForm((prev) => ({
                                ...prev,
                                events: checked
                                  ? prev.events.filter((item) => item !== event.key)
                                  : [...prev.events, event.key],
                              }))
                            }
                          />
                          {event.label}
                        </label>
                      );
                    },
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={busy === "create_webhook"}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {busy === "create_webhook" ? "Saving…" : "Create webhook"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {(data?.endpoints ?? []).map((endpoint) => (
              <article
                key={endpoint.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-brand-950">{endpoint.name}</h3>
                    <p className="mt-1 break-all text-xs text-slate-500">{endpoint.url}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      endpoint.active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {endpoint.active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {endpoint.events.split(",").map((event) => (
                    <span
                      key={event}
                      className="rounded-md bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                <p className="mt-3 font-mono text-[11px] text-slate-400">
                  secret {endpoint.secret}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void act("test_webhook", { id: endpoint.id })}
                    className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Send test
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void act("toggle_webhook", {
                        id: endpoint.id,
                        active: !endpoint.active,
                      })
                    }
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                  >
                    {endpoint.active ? "Pause" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void act("delete_webhook", { id: endpoint.id })}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-coral-400"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {data && data.endpoints.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No webhooks yet.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "webhooks" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-brand-950">Delivery log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Endpoint</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.deliveries ?? []).map((delivery) => (
                  <tr key={delivery.id}>
                    <td className="px-6 py-3 text-slate-500">
                      {timeLabel(delivery.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand-950">
                      {delivery.event}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {delivery.endpointName ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                          STATUS_STYLES[delivery.status] ?? STATUS_STYLES.pending
                        }`}
                      >
                        {delivery.status}
                        {delivery.responseCode ? ` ${delivery.responseCode}` : ""}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-6 py-3 text-xs text-slate-500">
                      {delivery.responseBody}
                    </td>
                  </tr>
                ))}
                {data && data.deliveries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                      No deliveries yet. Send a test ping or move a deal.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "developers" && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-brand-950">Inbound webhook tokens</h2>
            <p className="mt-1 text-sm text-slate-500">
              POST a lead to the token URL and NexagrowthCRM creates the contact,
              the deal, and a timeline note — then fires your outbound webhooks.
            </p>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void act("create_token", { name: tokenName });
              }}
              className="mt-5 flex gap-2"
            >
              <input
                className={FIELD}
                value={tokenName}
                onChange={(event) => setTokenName(event.target.value)}
                placeholder="Token name"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white"
              >
                Create
              </button>
            </form>
            <ul className="mt-5 space-y-3">
              {(data?.tokens ?? []).map((token) => (
                <li key={token.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold text-brand-950">{token.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        token.revoked
                          ? "bg-slate-100 text-slate-500"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {token.revoked ? "Revoked" : "Active"}
                    </span>
                  </div>
                  <p className="mt-2 break-all font-mono text-xs text-slate-600">
                    {token.token}
                  </p>
                  <p className="mt-2 break-all text-[11px] text-slate-400">
                    POST {origin || ""}/api/hooks/inbound/{token.token}
                  </p>
                  {!token.revoked && (
                    <button
                      type="button"
                      onClick={() => void act("revoke_token", { id: token.id })}
                      className="mt-3 text-xs font-bold text-slate-400 hover:text-coral-400"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-brand-950 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-400">
              Try the loop
            </p>
            <h2 className="mt-2 text-xl font-extrabold">Push a sample lead</h2>
            <p className="mt-2 text-sm text-white/70">
              Uses {activeToken ? activeToken.name : "your first active token"} to
              create Jordan Blake at Orbit Media, then notifies every subscribed
              webhook.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-black/30 p-4 text-xs leading-relaxed text-aqua-400">
{`curl -X POST ${origin || "https://your-workspace"}/api/hooks/inbound/${activeToken?.token ?? "TOKEN"} \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Jordan Blake","email":"jordan@orbitmedia.co","company":"Orbit Media","amount":18000}'`}
            </pre>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={!activeToken || busy === "sample_lead"}
                onClick={() => void act("sample_lead")}
                className="rounded-xl bg-aqua-400 px-5 py-3 text-sm font-bold text-brand-950 disabled:opacity-50"
              >
                {busy === "sample_lead" ? "Writing lead…" : "Send sample lead"}
              </button>
              <Link
                href="/app/crm/deals"
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white"
              >
                Open pipeline
              </Link>
            </div>
          </div>
        </div>
      )}

      {connecting && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 sm:p-8">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void act("connect", { appKey: connecting, config });
            }}
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-soft"
          >
            <h2 className="text-xl font-extrabold text-brand-950">
              Connect {APP_CATALOG.find((app) => app.key === connecting)?.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Settings are stored in PostgreSQL for this workspace. No external
              OAuth round-trip is required in the demo.
            </p>
            <div className="mt-5 space-y-4">
              {(APP_CATALOG.find((app) => app.key === connecting)?.fields ?? []).map(
                (field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      {field.label}
                    </span>
                    <input
                      required
                      className={FIELD}
                      placeholder={field.placeholder}
                      value={config[field.key] ?? ""}
                      onChange={(event) =>
                        setConfig((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  </label>
                ),
              )}
              {(APP_CATALOG.find((app) => app.key === connecting)?.fields.length ?? 0) ===
                0 && (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  This app connects with workspace defaults. Confirm to enable it.
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={busy === "connect"}
                className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy === "connect" ? "Connecting…" : "Connect app"}
              </button>
              <button
                type="button"
                onClick={() => setConnecting(null)}
                className="text-sm font-semibold text-slate-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
