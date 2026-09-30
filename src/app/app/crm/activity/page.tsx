"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ActivityRecord,
  type ContactRecord,
  type DealRecord,
  apiSend,
  initials,
  shortDate,
} from "@/lib/types";

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const TYPES = [
  { key: "call", label: "Call", icon: "M6 4h4l2 5-2.5 1.5a11 11 0 004 4L15 12l5 2v4a2 2 0 01-2 2A16 16 0 014 6a2 2 0 012-2Z" },
  { key: "email", label: "Email", icon: "M3 6h18v12H3zM3 7l9 6 9-6" },
  { key: "meeting", label: "Meeting", icon: "M4 6h16v11H4zM9 20h6M12 17v3M8 10h3M8 13h6" },
  { key: "note", label: "Note", icon: "M6 4h9l4 4v12H6zM9 10h6M9 14h6" },
] as const;

const OUTCOMES = ["positive", "neutral", "negative", "won", "lost"];

const OUTCOME_STYLES: Record<string, string> = {
  positive: "bg-emerald-50 text-emerald-600",
  neutral: "bg-slate-100 text-slate-500",
  negative: "bg-rose-50 text-coral-400",
  won: "bg-emerald-50 text-emerald-600",
  lost: "bg-rose-50 text-coral-400",
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "call",
    subject: "",
    body: "",
    dealId: "",
    contactId: "",
    outcome: "positive",
    owner: "Amara Okafor",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [activityRes, dealRes, contactRes] = await Promise.all([
        fetch("/api/crm/activities", { cache: "no-store" }),
        fetch("/api/crm/deals", { cache: "no-store" }),
        fetch("/api/crm/contacts", { cache: "no-store" }),
      ]);
      const [activityData, dealData, contactData] = (await Promise.all([
        activityRes.json(),
        dealRes.json(),
        contactRes.json(),
      ])) as { data: unknown }[];
      setActivities((activityData.data ?? []) as ActivityRecord[]);
      setDeals((dealData.data ?? []) as DealRecord[]);
      setContacts((contactData.data ?? []) as ContactRecord[]);
      setError("");
    } catch {
      setError("Could not load the timeline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dealTitleById = useMemo(
    () => new Map(deals.map((deal) => [deal.id, deal.title])),
    [deals],
  );
  const contactNameById = useMemo(
    () =>
      new Map(
        contacts.map((contact) => [
          contact.id,
          `${contact.firstName} ${contact.lastName}`.trim(),
        ]),
      ),
    [contacts],
  );

  const visible = activities.filter(
    (activity) => filter === "all" || activity.type === filter,
  );

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await apiSend("/api/crm/activities", "POST", {
        ...form,
        dealId: form.dealId ? Number(form.dealId) : null,
        contactId: form.contactId ? Number(form.contactId) : null,
      });
      setForm((prev) => ({ ...prev, subject: "", body: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log activity");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await apiSend(`/api/crm/activities/${id}`, "DELETE");
    await load();
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          Work · Activity
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
          Activity timeline
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Calls, emails, meetings and notes — every touchpoint in one feed.
        </p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_1.6fr]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-bold text-brand-950">Log an activity</h2>
          <p className="mt-1 text-sm text-slate-500">
            It is written to PostgreSQL and linked to the deal timeline.
          </p>

          <div className="mt-5 grid gap-4">
            <div>
              <span className={LABEL}>Type</span>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => update("type", type.key)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                      form.type === type.key
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-500 hover:border-brand-300"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                      <path
                        d={type.icon}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <label>
              <span className={LABEL}>Subject *</span>
              <input
                required
                className={FIELD}
                value={form.subject}
                onChange={(event) => update("subject", event.target.value)}
                placeholder="Discovery call with the buyer"
              />
            </label>

            <label>
              <span className={LABEL}>Details</span>
              <textarea
                rows={4}
                className={FIELD}
                value={form.body}
                onChange={(event) => update("body", event.target.value)}
                placeholder="What was discussed, agreed next steps…"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={LABEL}>Deal</span>
                <select
                  className={FIELD}
                  value={form.dealId}
                  onChange={(event) => update("dealId", event.target.value)}
                >
                  <option value="">— none —</option>
                  {deals.map((deal) => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Contact</span>
                <select
                  className={FIELD}
                  value={form.contactId}
                  onChange={(event) => update("contactId", event.target.value)}
                >
                  <option value="">— none —</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Outcome</span>
                <select
                  className={FIELD}
                  value={form.outcome}
                  onChange={(event) => update("outcome", event.target.value)}
                >
                  {OUTCOMES.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {outcome}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Owner</span>
                <input
                  className={FIELD}
                  value={form.owner}
                  onChange={(event) => update("owner", event.target.value)}
                />
              </label>
            </div>

            {error && (
              <p className="rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save to timeline"}
            </button>
          </div>
        </form>

        <div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                filter === "all"
                  ? "bg-brand-500 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-brand-300"
              }`}
            >
              All ({activities.length})
            </button>
            {TYPES.map((type) => {
              const count = activities.filter((item) => item.type === type.key).length;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setFilter(type.key)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    filter === type.key
                      ? "bg-brand-500 text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-brand-300"
                  }`}
                >
                  {type.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
            <ol className="relative space-y-6 border-l border-slate-200 pl-6">
              {visible.map((activity) => {
                const meta = TYPES.find((type) => type.key === activity.type);
                return (
                  <li key={activity.id} className="relative">
                    <span className="absolute -left-[37px] inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                        <path
                          d={meta?.icon ?? TYPES[3].icon}
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-brand-950">
                        {activity.subject}
                      </p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          OUTCOME_STYLES[activity.outcome] ?? OUTCOME_STYLES.neutral
                        }`}
                      >
                        {activity.outcome}
                      </span>
                    </div>
                    {activity.body && (
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {activity.body}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-400 text-[9px] font-bold text-white">
                          {initials(activity.owner)}
                        </span>
                        {activity.owner}
                      </span>
                      <span>{shortDate(activity.occurredAt)}</span>
                      {activity.dealId && (
                        <span className="font-semibold text-brand-600">
                          {dealTitleById.get(activity.dealId)}
                        </span>
                      )}
                      {activity.contactId && (
                        <span>
                          {contactNameById.get(activity.contactId)}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => void remove(activity.id)}
                        className="ml-auto font-semibold text-slate-400 transition hover:text-coral-400"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
              {!loading && visible.length === 0 && (
                <li className="py-10 text-center text-sm text-slate-500">
                  No activity of this type yet — log the first one.
                </li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
