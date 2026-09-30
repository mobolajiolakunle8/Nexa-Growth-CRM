export type StageKey =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type DealRecord = {
  id: number;
  title: string;
  contactId: number | null;
  companyId: number | null;
  amount: string;
  currency: string;
  stage: StageKey;
  probability: number;
  owner: string;
  source: string;
  expectedCloseDate: string | null;
  notes: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type ContactRecord = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  companyId: number | null;
  source: string;
  stage: string;
  owner: string;
  tags: string | null;
  createdAt: string;
  lastTouchedAt: string;
};

export type CompanyRecord = {
  id: number;
  name: string;
  industry: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  employees: string | null;
  annualRevenue: string;
  owner: string;
  notes: string | null;
  createdAt: string;
};

export type TaskRecord = {
  id: number;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee: string;
  dealId: number | null;
  contactId: number | null;
  dueDate: string | null;
  createdAt: string;
};

export type ActivityRecord = {
  id: number;
  type: "call" | "email" | "meeting" | "note";
  subject: string;
  body: string | null;
  dealId: number | null;
  contactId: number | null;
  owner: string;
  outcome: string;
  occurredAt: string;
};

export type Relation = { id: number; label: string };

export const STAGES: {
  key: StageKey;
  label: string;
  color: string;
  probability: number;
}[] = [
  { key: "new", label: "New", color: "#38bdf8", probability: 15 },
  { key: "qualified", label: "Qualified", color: "#6366f1", probability: 40 },
  { key: "proposal", label: "Proposal", color: "#f59e0b", probability: 60 },
  { key: "negotiation", label: "Negotiation", color: "#f43f5e", probability: 80 },
  { key: "won", label: "Closed won", color: "#10b981", probability: 100 },
  { key: "lost", label: "Closed lost", color: "#94a3b8", probability: 0 },
];

export const OWNERS = [
  "Amara Okafor",
  "Chinedu Menon",
  "Sofia Adeyemi",
  "Noah Balogun",
  "Priya Raman",
];

export const CURRENCY_CODE = "NGN";
export const CURRENCY_SYMBOL = "₦";
export const CURRENCY_LOCALE = "en-NG";

export function money(value: string | number, compact = false) {
  const amount = Number(value);
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(CURRENCY_LOCALE, {
    style: "currency",
    currency: CURRENCY_CODE,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
    minimumFractionDigits: 0,
  }).format(safe);
}

export function shortDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export async function apiSend<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error ?? "Request failed");
  }
  const payload = (await response.json()) as { data?: T };
  return (payload.data ?? (payload as unknown)) as T;
}
