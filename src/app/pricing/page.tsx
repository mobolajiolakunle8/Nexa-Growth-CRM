import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import PricingTable from "@/components/marketing/PricingTable";
import Faq from "@/components/marketing/Faq";
import { btnPrimary, sectionLabel } from "@/components/brand";

export const metadata: Metadata = {
  title: "Pricing — NexagrowthCRM",
  description:
    "Flat per-organisation pricing for CRM, tasks, automation, sites and BI. Free plan forever, 14-day trial of every feature.",
};

const COMPARISON = [
  { feature: "Unlimited contacts & deals", free: true, basic: true, standard: true, professional: true, enterprise: true },
  { feature: "Tasks & projects", free: true, basic: true, standard: true, professional: true, enterprise: true },
  { feature: "Quotes & invoices", free: false, basic: true, standard: true, professional: true, enterprise: true },
  { feature: "Automation rules & scripts", free: false, basic: false, standard: true, professional: true, enterprise: true },
  { feature: "Telephony & WhatsApp", free: false, basic: false, standard: true, professional: true, enterprise: true },
  { feature: "Sites, store & webforms", free: "Forms only", basic: "1 site", standard: "5 sites", professional: "Unlimited", enterprise: "Unlimited" },
  { feature: "Sales Intelligence & forecast", free: false, basic: false, standard: false, professional: true, enterprise: true },
  { feature: "HR & workload management", free: false, basic: false, standard: false, professional: true, enterprise: true },
  { feature: "BI dashboards", free: false, basic: "Basic", standard: "10", professional: "40+", enterprise: "40+ custom" },
  { feature: "SSO / SAML & audit logs", free: false, basic: false, standard: false, professional: false, enterprise: true },
  { feature: "On-premise deployment", free: false, basic: false, standard: false, professional: false, enterprise: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mint-400/15 text-emerald-600">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path d="M4 10.5l3.2 3.2L16 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return <span className="text-slate-300">—</span>;
  }
  return <span className="text-sm font-semibold text-slate-600">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="relative overflow-hidden bg-brand-950 py-20 text-white">
          <div className="grid-glow absolute inset-0 opacity-80" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-aqua-400">
              Transparent pricing
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              One workspace, one flat price
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">
              CRM, projects, contact centre, sites, automation and BI included.
              No per-seat fees, no contact caps, no surprise overages.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className={btnPrimary}>
                Start 14-day free trial
              </Link>
              <Link
                href="/app/crm"
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Open demo workspace
              </Link>
            </div>
          </div>
        </section>

        <PricingTable />

        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className={sectionLabel}>Compare</span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
                Feature comparison
              </h2>
            </div>
            <div className="mt-12 overflow-x-auto rounded-3xl border border-slate-200">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-bold text-brand-950">
                      Feature
                    </th>
                    {["Free", "Basic", "Standard", "Professional", "Enterprise"].map(
                      (plan) => (
                        <th
                          key={plan}
                          className="px-4 py-4 text-center text-sm font-bold text-brand-950"
                        >
                          {plan}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COMPARISON.map((row) => (
                    <tr key={row.feature} className="hover:bg-brand-50/40">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {row.feature}
                      </td>
                      <td className="px-4 py-4 text-center"><Cell value={row.free} /></td>
                      <td className="px-4 py-4 text-center"><Cell value={row.basic} /></td>
                      <td className="px-4 py-4 text-center"><Cell value={row.standard} /></td>
                      <td className="px-4 py-4 text-center"><Cell value={row.professional} /></td>
                      <td className="px-4 py-4 text-center"><Cell value={row.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className={sectionLabel}>FAQ</span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-brand-950 sm:text-4xl">
                Billing questions
              </h2>
            </div>
            <Faq />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
