import Link from "next/link";
import { btnAqua, btnGhost } from "@/components/brand";

const PIPELINE_PREVIEW = [
  {
    name: "New",
    tone: "from-sky-400 to-sky-500",
    total: "New",
    deals: ["Orbit Media bundle", "Sunrise storefront"],
  },
  {
    name: "Qualified",
    tone: "from-indigo-400 to-indigo-500",
    total: "Active",
    deals: ["Vertex 480 seats", "Lumen 6 clinics"],
  },
  {
    name: "Proposal",
    tone: "from-amber-400 to-orange-500",
    total: "Review",
    deals: ["Baltic automation", "Brightpath CRM"],
  },
  {
    name: "Closed won",
    tone: "from-emerald-400 to-emerald-500",
    total: "Won",
    deals: ["Fintech Hive", "Studio Fornax"],
  },
];

const HIGHLIGHTS = [
  "Unlimited contacts & deals on every plan",
  "No per-user fees — pay for the workspace",
  "Migrate from your old CRM in 1 day",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-950 text-white">
      <div className="grid-glow absolute inset-0 opacity-90" />
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-aqua-400/20 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-aqua-400">
              <span className="h-1.5 w-1.5 rounded-full bg-aqua-400" />
              New: AI deal assistant + 2026 revenue dashboards
            </span>

            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Your whole company.
              <br />
              <span className="gradient-text">One workspace.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              NexagrowthCRM brings CRM, tasks, contact centre, websites,
              automation and BI into a single online platform. Stop paying for
              six tools that never talk to each other.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup" className={btnAqua}>
                Start free — 14 days
              </Link>
              <Link
                href="/app/crm"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Open the live demo
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d="M4 10h11m0 0-4-4m4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </div>

            <ul className="mt-8 space-y-2.5">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                  <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0 text-mint-400" fill="none">
                    <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
                    <path
                      d="M6 10.4l2.6 2.6L14 7.6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-fade-up">
            <div className="rounded-3xl border border-white/12 bg-white/95 p-4 shadow-soft backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-coral-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sun-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-mint-400" />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Pipeline · Q3 forecast
                </p>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Open deals", value: "24", tone: "text-brand-600" },
                  { label: "Win rate", value: "67%", tone: "text-mint-400" },
                  { label: "Avg. cycle", value: "23d", tone: "text-violet-400" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3"
                  >
                    <p className="text-[11px] font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className={`text-lg font-extrabold ${stat.tone}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {PIPELINE_PREVIEW.map((column, index) => (
                  <div
                    key={column.name}
                    className="rounded-2xl border border-slate-100 bg-white p-3"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-md bg-gradient-to-r ${column.tone} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white`}
                      >
                        {column.name}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {column.total}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {column.deals.map((deal) => (
                        <div
                          key={deal}
                          className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2"
                        >
                          <p className="text-[12px] font-semibold text-brand-950">
                            {deal}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
                            <span className="text-[10px] text-slate-500">
                              Active · 2 tasks
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-950 px-4 py-3 text-white">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/50">
                    AI next best action
                  </p>
                  <p className="text-[13px] font-semibold">
                    Send quote reminder to Vertex Manufacturing
                  </p>
                </div>
                <span className="rounded-lg bg-aqua-400 px-3 py-1.5 text-[11px] font-bold text-brand-950">
                  Do it
                </span>
              </div>
            </div>

            <div className="animate-floaty absolute -bottom-8 -left-6 hidden rounded-2xl border border-white/15 bg-white/95 p-3 shadow-card lg:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                New lead
              </p>
              <p className="text-xs font-semibold text-brand-950">
                WhatsApp · Dana Whitmore
              </p>
              <p className="text-[10px] text-mint-400">Assigned automatically</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-brand-950/60 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
            Trusted by 2,400+ Nigerian revenue teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-white/45">
            {[
              "NORTHWIND NG",
              "SAHEL LOGISTICS",
              "VERTEX MFG",
              "LUMEN DENTAL",
              "FINTECH HIVE",
              "SUNRISE RETAIL",
              "STUDIO FORNAX",
            ].map((brand) => (
              <span key={brand} className="tracking-[0.12em]">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
