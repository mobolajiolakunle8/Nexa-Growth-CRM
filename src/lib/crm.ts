import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  activities,
  companies,
  contacts,
  deals,
  tasks,
  trialRequests,
  type Activity,
  type Company,
  type Contact,
  type Deal,
  type Task,
} from "@/db/schema";
import { ensureSeed } from "@/db/seed";

export const PIPELINE_STAGES = [
  { key: "new", label: "New", color: "#38bdf8", probability: 15 },
  { key: "qualified", label: "Qualified", color: "#6366f1", probability: 40 },
  { key: "proposal", label: "Proposal", color: "#f59e0b", probability: 60 },
  {
    key: "negotiation",
    label: "Negotiation",
    color: "#f43f5e",
    probability: 80,
  },
  { key: "won", label: "Closed won", color: "#10b981", probability: 100 },
  { key: "lost", label: "Closed lost", color: "#94a3b8", probability: 0 },
] as const;

export type StageKey = (typeof PIPELINE_STAGES)[number]["key"];

export function stageMeta(stage: string) {
  return (
    PIPELINE_STAGES.find((item) => item.key === stage) ?? PIPELINE_STAGES[0]
  );
}

export function formatMoney(value: number | string, compact = true) {
  const amount = typeof value === "string" ? Number(value) : value;
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
    minimumFractionDigits: 0,
  }).format(safe);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeTime(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export type DealWithRelations = Deal & {
  contactName: string | null;
  companyName: string | null;
};

export type ContactWithCompany = Contact & { companyName: string | null };
export type CompanyWithStats = Company & {
  openDeals: number;
  pipelineValue: number;
};
export type TaskWithRelations = Task & {
  dealTitle: string | null;
  contactName: string | null;
};
export type ActivityWithRelations = Activity & {
  dealTitle: string | null;
  contactName: string | null;
};

export type DashboardStats = {
  openPipeline: number;
  wonRevenue: number;
  openDealCount: number;
  wonDealCount: number;
  contactCount: number;
  companyCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
  winRate: number;
  avgDealSize: number;
  stageTotals: { key: string; label: string; color: string; total: number; count: number }[];
  sourceTotals: { source: string; total: number }[];
  ownerTotals: { owner: string; total: number; count: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureSeed();

  const [aggregate] = await db
    .select({
      openPipeline: sql<string>`coalesce(sum(case when ${deals.stage} not in ('won','lost') then ${deals.amount} else 0 end), 0)`,
      wonRevenue: sql<string>`coalesce(sum(case when ${deals.stage} = 'won' then ${deals.amount} else 0 end), 0)`,
      openDealCount: sql<string>`count(*) filter (where ${deals.stage} not in ('won','lost'))`,
      wonDealCount: sql<string>`count(*) filter (where ${deals.stage} = 'won')`,
      lostDealCount: sql<string>`count(*) filter (where ${deals.stage} = 'lost')`,
      totalDealCount: sql<string>`count(*)`,
    })
    .from(deals);

  const stageRows = await db
    .select({
      stage: deals.stage,
      total: sql<string>`coalesce(sum(${deals.amount}), 0)`,
      count: sql<string>`count(*)`,
    })
    .from(deals)
    .groupBy(deals.stage);

  const sourceRows = await db
    .select({
      source: deals.source,
      total: sql<string>`coalesce(sum(${deals.amount}), 0)`,
    })
    .from(deals)
    .groupBy(deals.source)
    .orderBy(desc(sql`sum(${deals.amount})`))
    .limit(5);

  const ownerRows = await db
    .select({
      owner: deals.owner,
      total: sql<string>`coalesce(sum(${deals.amount}), 0)`,
      count: sql<string>`count(*)`,
    })
    .from(deals)
    .groupBy(deals.owner)
    .orderBy(desc(sql`sum(${deals.amount})`))
    .limit(5);

  const [contactCount] = await db
    .select({ value: sql<string>`count(*)` })
    .from(contacts);
  const [companyCount] = await db
    .select({ value: sql<string>`count(*)` })
    .from(companies);
  const [taskCounts] = await db
    .select({
      open: sql<string>`count(*) filter (where ${tasks.status} <> 'completed')`,
      overdue: sql<string>`count(*) filter (where ${tasks.status} <> 'completed' and ${tasks.dueDate} < current_date)`,
    })
    .from(tasks);

  const openPipeline = Number(aggregate?.openPipeline ?? 0);
  const wonRevenue = Number(aggregate?.wonRevenue ?? 0);
  const won = Number(aggregate?.wonDealCount ?? 0);
  const lost = Number(aggregate?.lostDealCount ?? 0);

  return {
    openPipeline,
    wonRevenue,
    openDealCount: Number(aggregate?.openDealCount ?? 0),
    wonDealCount: won,
    contactCount: Number(contactCount?.value ?? 0),
    companyCount: Number(companyCount?.value ?? 0),
    openTaskCount: Number(taskCounts?.open ?? 0),
    overdueTaskCount: Number(taskCounts?.overdue ?? 0),
    winRate: won + lost === 0 ? 0 : Math.round((won / (won + lost)) * 100),
    avgDealSize:
      Number(aggregate?.totalDealCount ?? 0) === 0
        ? 0
        : Math.round(
            (openPipeline + wonRevenue) /
              Number(aggregate?.totalDealCount ?? 1),
          ),
    stageTotals: PIPELINE_STAGES.map((stage) => {
      const row = stageRows.find((item) => item.stage === stage.key);
      return {
        key: stage.key,
        label: stage.label,
        color: stage.color,
        total: Number(row?.total ?? 0),
        count: Number(row?.count ?? 0),
      };
    }),
    sourceTotals: sourceRows.map((row) => ({
      source: row.source,
      total: Number(row.total),
    })),
    ownerTotals: ownerRows.map((row) => ({
      owner: row.owner,
      total: Number(row.total),
      count: Number(row.count),
    })),
  };
}

export async function getDeals(): Promise<DealWithRelations[]> {
  await ensureSeed();
  const rows = await db
    .select({
      deal: deals,
      contactFirst: contacts.firstName,
      contactLast: contacts.lastName,
      companyName: companies.name,
    })
    .from(deals)
    .leftJoin(contacts, eq(deals.contactId, contacts.id))
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .orderBy(deals.position, desc(deals.createdAt));

  return rows.map((row) => ({
    ...row.deal,
    contactName:
      row.contactFirst === null ? null : `${row.contactFirst} ${row.contactLast ?? ""}`.trim(),
    companyName: row.companyName,
  }));
}

export async function getContacts(): Promise<ContactWithCompany[]> {
  await ensureSeed();
  const rows = await db
    .select({ contact: contacts, companyName: companies.name })
    .from(contacts)
    .leftJoin(companies, eq(contacts.companyId, companies.id))
    .orderBy(desc(contacts.createdAt));

  return rows.map((row) => ({ ...row.contact, companyName: row.companyName }));
}

export async function getCompanies(): Promise<CompanyWithStats[]> {
  await ensureSeed();
  const rows = await db
    .select({
      company: companies,
      openDeals: sql<string>`count(${deals.id}) filter (where ${deals.stage} not in ('won','lost'))`,
      pipelineValue: sql<string>`coalesce(sum(case when ${deals.stage} not in ('won','lost') then ${deals.amount} else 0 end), 0)`,
    })
    .from(companies)
    .leftJoin(deals, eq(deals.companyId, companies.id))
    .groupBy(companies.id)
    .orderBy(desc(companies.createdAt));

  return rows.map((row) => ({
    ...row.company,
    openDeals: Number(row.openDeals ?? 0),
    pipelineValue: Number(row.pipelineValue ?? 0),
  }));
}

export async function getTasks(): Promise<TaskWithRelations[]> {
  await ensureSeed();
  const rows = await db
    .select({
      task: tasks,
      dealTitle: deals.title,
      contactFirst: contacts.firstName,
      contactLast: contacts.lastName,
    })
    .from(tasks)
    .leftJoin(deals, eq(tasks.dealId, deals.id))
    .leftJoin(contacts, eq(tasks.contactId, contacts.id))
    .orderBy(tasks.status, tasks.dueDate);

  return rows.map((row) => ({
    ...row.task,
    dealTitle: row.dealTitle,
    contactName:
      row.contactFirst === null
        ? null
        : `${row.contactFirst} ${row.contactLast ?? ""}`.trim(),
  }));
}

export async function getActivities(limit = 25): Promise<ActivityWithRelations[]> {
  await ensureSeed();
  const rows = await db
    .select({
      activity: activities,
      dealTitle: deals.title,
      contactFirst: contacts.firstName,
      contactLast: contacts.lastName,
    })
    .from(activities)
    .leftJoin(deals, eq(activities.dealId, deals.id))
    .leftJoin(contacts, eq(activities.contactId, contacts.id))
    .orderBy(desc(activities.occurredAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row.activity,
    dealTitle: row.dealTitle,
    contactName:
      row.contactFirst === null
        ? null
        : `${row.contactFirst} ${row.contactLast ?? ""}`.trim(),
  }));
}

export async function getTrialRequests() {
  await ensureSeed();
  return db
    .select()
    .from(trialRequests)
    .orderBy(desc(trialRequests.createdAt))
    .limit(50);
}

export async function getOpenTasksForDashboard() {
  await ensureSeed();
  return db
    .select()
    .from(tasks)
    .where(and(sql`${tasks.status} <> 'completed'`))
    .orderBy(tasks.dueDate)
    .limit(6);
}
