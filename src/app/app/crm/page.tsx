import Link from "next/link";
import { redirect } from "next/navigation";
import { readPageSession } from "@/lib/auth/session";
import {
  getActivities,
  getDashboardStats,
  getDeals,
  getTasks,
} from "@/lib/crm";
import { STAGES, initials, shortDate } from "@/lib/types";

export const dynamic = "force-dynamic";

const KPI_CARDS = [
  {
    key: "pipeline",
    label: "Open pipeline",
    accent: "from-brand-500 to-brand-600",
    hint: "deals not yet closed",
  },
  {
    key: "won",
    label: "Closed won",
    accent: "from-emerald-400 to-teal-500",
    hint: "revenue this period",
  },
  {
    key: "winrate",
    label: "Win rate",
    accent: "from-violet-400 to-indigo-500",
    hint: "won vs lost deals",
  },
  {
    key: "tasks",
    label: "Open tasks",
    accent: "from-amber-400 to-orange-500",
    hint: "across the team",
  },
] as const;

const ACTIVITY_ICONS: Record<string, string> = {
  call: "M6 4h4l2 5-2.5 1.5a11 11 0 004 4L15 12l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2Z",
  email: "M3 6h18v12H3zM3 7l9 6 9-6",
  meeting: "M4 6h16v11H4zM9 20h6M12 17v3M8 10h3M8 13h6",
  note: "M6 4h9l4 4v12H6zM9 10h6M9 14h6",
};

export default async function DashboardPage() {
  const session = await readPageSession();
  if (!session) redirect("/login");
  const [stats, deals, tasks, activities] = await Promise.all([
    getDashboardStats(session.workspaceId),
    getDeals(session.workspaceId),
    getTasks(session.workspaceId),
    getActivities(6, session.workspaceId),
  ]);

  const maxStage = Math.max(...stats.stageTotals.map((item) => item.total), 1);
  const maxSource = Math.max(...stats.sourceTotals.map((item) => item.total), 1);
  const openDeals = deals
    .filter((deal) => deal.stage !== "won" && deal.stage !== "lost")
    .slice(0, 6);
  const dueTasks = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 6);

  const kpiValues: Record<string, { value: string; sub: string }> = {
    pipeline: {
      value: String(stats.openDealCount),
      sub: "open deals",
    },
    won: {
      value: String(stats.wonDealCount),
      sub: "deals won",
    },
    winrate: {
      value: `${stats.winRate}%`,
      sub: "won against lost",
    },
    tasks: {
      value: String(stats.openTaskCount),
      sub: `${stats.overdueTaskCount} overdue`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            Dashboard
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            {session.workspaceName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {stats.contactCount} contacts · {stats.companyCount} companies ·{" "}
            {stats.openDealCount} deals in play
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/crm/deals"
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            Open pipeline
          </Link>
          <Link
            href="/app/crm/activity"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-300"
          >
            Log activity
          </Link>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((card) => {
          const data = kpiValues[card.key];
          return (
            <div
              key={card.key}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5"
            >
              <span
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`}
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-brand-950">
                {data.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{data.sub}</p>
              <p className="mt-3 text-[11px] font-medium text-slate-400">
                {card.hint}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-950">
                Sales funnel by stage
              </h2>
              <p className="text-sm text-slate-500">
                Total value of deals currently sitting in each stage
              </p>
            </div>
            <Link
              href="/app/crm/deals"
              className="text-sm font-semibold text-brand-600 hover:text-brand-800"
            >
              View pipeline
            </Link>
          </div>

          <div className="mt-7 flex h-56 items-end gap-4">
            {stats.stageTotals.map((stage, index) => (
              <div key={stage.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {stage.count}
                </span>
                <div
                  className="animate-bar w-full rounded-t-xl"
                  style={{
                    height: `${Math.max((stage.total / maxStage) * 100, 4)}%`,
                    background: `linear-gradient(180deg, ${stage.color}, ${stage.color}aa)`,
                    animationDelay: `${index * 80}ms`,
                  }}
                />
                <span className="text-[11px] font-semibold text-slate-500">
                  {stage.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  {stage.count} deals
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-brand-950">Revenue by source</h2>
            <ul className="mt-4 space-y-3">
              {stats.sourceTotals.map((source) => (
                <li key={source.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {source.source}
                    </span>
                    <span className="font-bold text-brand-950">
                      {source.source}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-aqua-400"
                      style={{ width: `${(source.total / maxSource) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-brand-950">Team leaderboard</h2>
            <ul className="mt-4 space-y-3">
              {stats.ownerTotals.map((owner, index) => (
                <li key={owner.owner} className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-400 text-xs font-bold text-white">
                    {initials(owner.owner)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-950">
                      {owner.owner}
                    </p>
                    <p className="text-xs text-slate-500">{owner.count} deals</p>
                  </div>
                  <span
                    className={`rounded-lg px-2 py-1 text-xs font-bold ${
                      index === 0
                        ? "bg-mint-400/15 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {owner.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-brand-950">Hot deals</h2>
            <Link
              href="/app/crm/deals"
              className="text-sm font-semibold text-brand-600 hover:text-brand-800"
            >
              All deals
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Deal</th>
                  <th className="px-4 py-3 font-semibold">Company</th>
                  <th className="px-4 py-3 font-semibold">Stage</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-6 py-3 text-right font-semibold">Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {openDeals.map((deal) => {
                  const stage = STAGES.find((item) => item.key === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-brand-50/40">
                      <td className="px-6 py-3.5 font-semibold text-brand-950">
                        {deal.title}
                        <span className="block text-xs font-normal text-slate-400">
                          {deal.contactName ?? "No contact"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {deal.companyName ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                          style={{ backgroundColor: stage?.color ?? "#64748b" }}
                        >
                          {stage?.label ?? deal.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-brand-950">
                        {deal.stage}
                      </td>
                      <td className="px-6 py-3.5 text-right text-slate-500">
                        {shortDate(deal.expectedCloseDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-brand-950">Tasks due</h2>
              <Link
                href="/app/crm/tasks"
                className="text-sm font-semibold text-brand-600 hover:text-brand-800"
              >
                All
              </Link>
            </div>
            <ul className="mt-4 space-y-3">
              {dueTasks.map((task) => {
                const overdue = (task.dueDate ?? "") < new Date().toISOString().slice(0, 10);
                return (
                  <li key={task.id} className="flex items-start gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        task.priority === "high"
                          ? "bg-coral-400"
                          : task.priority === "medium"
                            ? "bg-sun-400"
                            : "bg-slate-300"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brand-950">
                        {task.title}
                      </p>
                      <p
                        className={`text-xs ${
                          overdue ? "font-semibold text-coral-400" : "text-slate-500"
                        }`}
                      >
                        {shortDate(task.dueDate)} · {task.assignee}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold text-brand-950">Latest activity</h2>
            <ul className="mt-4 space-y-4">
              {activities.map((activity) => (
                <li key={activity.id} className="flex gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d={ACTIVITY_ICONS[activity.type] ?? ACTIVITY_ICONS.note}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-950">
                      {activity.subject}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {activity.owner} · {activity.dealTitle ?? activity.contactName ?? "CRM"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
