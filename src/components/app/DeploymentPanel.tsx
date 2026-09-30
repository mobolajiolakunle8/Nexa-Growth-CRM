"use client";

import { useCallback, useEffect, useState } from "react";

type DeployStatus = {
  ready: boolean;
  currency: string;
  deployment: {
    platform: string;
    environment: string;
    region: string;
    url: string | null;
    commit: string | null;
    branch: string | null;
    serverlessPooling: boolean;
  };
  env: {
    public: Record<string, boolean>;
    server: Record<string, boolean>;
  };
  missing: string[];
  database: {
    connected: boolean;
    latencyMs?: number;
    tableCount?: number;
    missingTables?: string[];
    error?: string;
  };
  checkedAt: string;
};

function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
        ok ? "bg-emerald-500" : "bg-coral-400"
      }`}
    />
  );
}

export default function DeploymentPanel() {
  const [data, setData] = useState<DeployStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/deploy/status", { cache: "no-store" });
      setData((await response.json()) as DeployStatus);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Platform · Deployment
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Deployment health
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Live readiness probe for this environment. Hit{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              /api/deploy/status
            </code>{" "}
            from CI or an uptime monitor after every Vercel release.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300"
        >
          {loading ? "Checking…" : "Re-run check"}
        </button>
      </div>

      {!data && (
        <div className="mt-6 h-48 animate-pulse rounded-3xl border border-slate-200 bg-white" />
      )}

      {data && (
        <>
          <div
            className={`mt-6 flex flex-wrap items-center gap-3 rounded-2xl border px-6 py-5 ${
              data.ready
                ? "border-emerald-200 bg-emerald-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <Dot ok={data.ready} />
            <p
              className={`text-lg font-extrabold ${
                data.ready ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {data.ready
                ? "All systems ready"
                : "Configuration incomplete"}
            </p>
            {data.missing.length > 0 && (
              <p className="text-sm text-amber-800">
                Missing: {data.missing.join(", ")}
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Platform", value: data.deployment.platform },
              { label: "Environment", value: data.deployment.environment },
              { label: "Region", value: data.deployment.region },
              {
                label: "DB latency",
                value: data.database.connected
                  ? `${data.database.latencyMs} ms`
                  : "offline",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-xl font-extrabold capitalize text-brand-950">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-bold text-brand-950">
                Environment variables
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Presence only — values are never returned by the API.
              </p>
              <ul className="mt-4 space-y-2">
                {Object.entries({
                  ...data.env.server,
                  ...data.env.public,
                }).map(([key, present]) => (
                  <li
                    key={key}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2"
                  >
                    <Dot ok={present} />
                    <code className="truncate text-xs text-slate-700">{key}</code>
                    <span
                      className={`ml-auto text-[10px] font-bold uppercase ${
                        present ? "text-emerald-600" : "text-coral-400"
                      }`}
                    >
                      {present ? "set" : "missing"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold text-brand-950">Database</h2>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Connection</dt>
                    <dd
                      className={`font-bold ${
                        data.database.connected
                          ? "text-emerald-600"
                          : "text-coral-400"
                      }`}
                    >
                      {data.database.connected ? "Connected" : "Unreachable"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Tables</dt>
                    <dd className="font-bold text-brand-950">
                      {data.database.tableCount ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Serverless pooling</dt>
                    <dd className="font-bold text-brand-950">
                      {data.deployment.serverlessPooling ? "On" : "Off"}
                    </dd>
                  </div>
                </dl>
                {data.database.missingTables &&
                  data.database.missingTables.length > 0 && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Missing tables: {data.database.missingTables.join(", ")} —
                      run <code>npx drizzle-kit push</code>.
                    </p>
                  )}
                {data.database.error && (
                  <p className="mt-3 rounded-lg bg-coral-400/10 px-3 py-2 text-xs text-coral-400">
                    {data.database.error}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-brand-950 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-aqua-400">
                  Release
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Commit</dt>
                    <dd className="font-mono text-white">
                      {data.deployment.commit ?? "local"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Branch</dt>
                    <dd className="truncate font-mono text-white">
                      {data.deployment.branch ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-white/50">Checked</dt>
                    <dd className="text-white/80">
                      {new Date(data.checkedAt).toLocaleTimeString("en-NG")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
