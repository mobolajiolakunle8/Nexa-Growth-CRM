import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { APP_CATALOG } from "@/lib/integration-catalog";
import { btnAqua, sectionLabel } from "@/components/brand";

export const metadata: Metadata = {
  title: "Integrations — NexagrowthCRM",
  description:
    "Connect WhatsApp, Slack, Stripe and the rest of your stack. Outbound webhooks and an inbound REST token keep NexagrowthCRM in sync.",
};

const PILLARS = [
  {
    title: "Channels first",
    body: "WhatsApp, Telegram and telephony should write straight onto the deal timeline. That is the integration that reps feel on day one.",
  },
  {
    title: "Outbound webhooks",
    body: "Subscribe Slack, Zapier or your own service to deal.created, deal.stage_changed and lead.captured. Every attempt is logged.",
  },
  {
    title: "Inbound REST token",
    body: "Your website, store or form tool POSTs a JSON lead. NexagrowthCRM creates the contact, the deal and fires your webhooks back out.",
  },
];

export default function IntegrationsMarketingPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand-950 py-20 text-white">
          <div className="grid-glow absolute inset-0 opacity-80" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-aqua-400">
              Recommended integration
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              Connect the channels. Then let events flow both ways.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
              Most CRMs bolt on a logo wall and stop. NexagrowthCRM ships a
              working marketplace, outbound webhooks with a delivery log, and an
              inbound token your site can call today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/app/crm/integrations" className={btnAqua}>
                Open the live marketplace
              </Link>
              <Link
                href="/signup"
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Start free workspace
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {PILLARS.map((pillar, index) => (
              <article
                key={pillar.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-7"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <h2 className="mt-4 text-xl font-extrabold text-brand-950">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {pillar.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className={sectionLabel}>Marketplace</span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-950">
                Sixteen apps you can connect in the demo
              </h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {APP_CATALOG.map((app) => (
                <div
                  key={app.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${app.tone} text-xs font-extrabold text-white`}
                  >
                    {app.name.slice(0, 2).toUpperCase()}
                  </span>
                  <h3 className="mt-3 font-bold text-brand-950">{app.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {app.category}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {app.blurb}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/app/crm/integrations"
                className="inline-flex rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600"
              >
                Connect apps in the workspace
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
