import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, formatMoney, getTrialRequests } from "@/lib/crm";

export const metadata: Metadata = {
  title: "Website leads — NexagrowthCRM",
};

export const dynamic = "force-dynamic";

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  basic: 60000,
  standard: 119000,
  professional: 239000,
  enterprise: 479000,
};

export default async function LeadsPage() {
  const leads = await getTrialRequests();

  const monthlyPotential = leads.reduce(
    (total, lead) => total + (PLAN_PRICES[lead.plan] ?? 0),
    0,
  );

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            CRM · Inbound
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Website leads
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Every trial request submitted on nexagrowthcrm.com lands here as a
            scored lead.
          </p>
        </div>
        <Link
          href="/signup"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:border-brand-300"
        >
          Open signup form
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Leads captured", value: String(leads.length) },
          {
            label: "Monthly potential",
            value: formatMoney(monthlyPotential),
          },
          {
            label: "Latest signup",
            value: leads[0] ? formatDate(leads[0].createdAt) : "—",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-extrabold text-brand-950">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Lead</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Team size</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-6 py-3 text-right font-semibold">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-brand-50/40">
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-brand-950">{lead.fullName}</p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {lead.company ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase text-brand-600">
                      {lead.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {lead.teamSize ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {lead.phone ?? "—"}
                  </td>
                  <td className="px-6 py-3.5 text-right text-slate-500">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-sm text-slate-500">
                    No inbound leads yet. Submit the{" "}
                    <Link href="/signup" className="font-semibold text-brand-600">
                      trial form
                    </Link>{" "}
                    and it will appear here instantly.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {leads[0]?.message && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-brand-950">Latest message</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            “{leads[0].message}”
          </p>
        </div>
      )}
    </div>
  );
}
