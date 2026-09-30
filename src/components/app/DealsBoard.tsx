"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STAGES,
  OWNERS,
  type CompanyRecord,
  type ContactRecord,
  type DealRecord,
  type StageKey,
  apiSend,
  money,
  shortDate,
} from "@/lib/types";

const SOURCES = [
  "Website",
  "Outbound",
  "Referral",
  "Webinar",
  "Trade Show",
  "Live Chat",
  "Ads",
  "Partner",
];

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

type FormState = {
  title: string;
  amount: string;
  stage: StageKey;
  owner: string;
  source: string;
  contactId: string;
  companyId: string;
  expectedCloseDate: string;
  probability: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  amount: "",
  stage: "new",
  owner: OWNERS[0],
  source: "Website",
  contactId: "",
  companyId: "",
  expectedCloseDate: "",
  probability: "20",
  notes: "",
};

export default function DealsBoard() {
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<StageKey | null>(null);
  const [saving, setSaving] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dealsRes, contactsRes, companiesRes] = await Promise.all([
        fetch("/api/crm/deals", { cache: "no-store" }),
        fetch("/api/crm/contacts", { cache: "no-store" }),
        fetch("/api/crm/companies", { cache: "no-store" }),
      ]);
      const [dealsData, contactsData, companiesData] = (await Promise.all([
        dealsRes.json(),
        contactsRes.json(),
        companiesRes.json(),
      ])) as { data: unknown }[];
      setDeals((dealsData.data ?? []) as DealRecord[]);
      setContacts((contactsData.data ?? []) as ContactRecord[]);
      setCompanies((companiesData.data ?? []) as CompanyRecord[]);
      setError("");
    } catch {
      setError("Could not load the pipeline. Refresh to retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () =>
      ownerFilter === "all"
        ? deals
        : deals.filter((deal) => deal.owner === ownerFilter),
    [deals, ownerFilter],
  );

  const openValue = useMemo(
    () =>
      visible
        .filter((deal) => deal.stage !== "won" && deal.stage !== "lost")
        .reduce((total, deal) => total + Number(deal.amount), 0),
    [visible],
  );

  const companyNameById = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies],
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

  function dealSubtitle(deal: DealRecord) {
    const company = deal.companyId ? companyNameById.get(deal.companyId) : undefined;
    const contact = deal.contactId ? contactNameById.get(deal.contactId) : undefined;
    return [company, contact].filter(Boolean).join(" · ") || "No linked records";
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate(stage: StageKey = "new") {
    setForm({ ...EMPTY_FORM, stage });
    setEditingId(null);
    setModal("create");
  }

  function openEdit(deal: DealRecord) {
    setForm({
      title: deal.title,
      amount: String(Number(deal.amount)),
      stage: deal.stage,
      owner: deal.owner,
      source: deal.source,
      contactId: deal.contactId ? String(deal.contactId) : "",
      companyId: deal.companyId ? String(deal.companyId) : "",
      expectedCloseDate: deal.expectedCloseDate ?? "",
      probability: String(deal.probability),
      notes: deal.notes ?? "",
    });
    setEditingId(deal.id);
    setModal("edit");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      amount: Number(form.amount || 0),
      stage: form.stage,
      owner: form.owner,
      source: form.source,
      contactId: form.contactId ? Number(form.contactId) : null,
      companyId: form.companyId ? Number(form.companyId) : null,
      expectedCloseDate: form.expectedCloseDate || null,
      probability: Number(form.probability || 0),
      notes: form.notes,
    };
    try {
      if (modal === "edit" && editingId) {
        await apiSend(`/api/crm/deals/${editingId}`, "PATCH", payload);
      } else {
        await apiSend("/api/crm/deals", "POST", payload);
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await apiSend(`/api/crm/deals/${id}`, "DELETE");
    setModal(null);
    await load();
  }

  async function moveDeal(id: number, stage: StageKey) {
    const previous = deals;
    setDeals((current) =>
      current.map((deal) =>
        deal.id === id
          ? {
              ...deal,
              stage,
              probability: STAGES.find((item) => item.key === stage)?.probability ?? deal.probability,
            }
          : deal,
      ),
    );
    try {
      await apiSend(`/api/crm/deals/${id}`, "PATCH", { stage });
    } catch {
      setDeals(previous);
      setError("Could not move that deal.");
    }
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            CRM · Deals
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Sales pipeline
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag a card between columns to move the deal — changes are saved to
            PostgreSQL instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-400"
          >
            <option value="all">All owners</option>
            {OWNERS.map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => openCreate("new")}
            className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            + New deal
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { label: "Open pipeline", value: money(openValue, true) },
          {
            label: "Deals",
            value: String(visible.filter((d) => d.stage !== "won" && d.stage !== "lost").length),
          },
          {
            label: "Weighted forecast",
            value: money(
              visible
                .filter((d) => d.stage !== "won" && d.stage !== "lost")
                .reduce((total, deal) => total + (Number(deal.amount) * deal.probability) / 100, 0),
              true,
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="text-lg font-extrabold text-brand-950">{item.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}

      <div className="kanban-scroll mt-6 overflow-x-auto pb-4">
        <div className="flex min-w-max gap-4">
          {STAGES.map((stage) => {
            const columnDeals = visible.filter((deal) => deal.stage === stage.key);
            const total = columnDeals.reduce((sum, deal) => sum + Number(deal.amount), 0);
            return (
              <div
                key={stage.key}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(stage.key);
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => {
                  setDragOver(null);
                  if (dragId) void moveDeal(dragId, stage.key);
                  setDragId(null);
                }}
                className={`w-72 shrink-0 rounded-2xl border p-3 transition ${
                  dragOver === stage.key
                    ? "border-brand-400 bg-brand-50"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2 text-sm font-bold text-brand-950">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.label}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {money(total, true)}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {columnDeals.map((deal) => (
                    <article
                      key={deal.id}
                      draggable
                      onDragStart={() => setDragId(deal.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => openEdit(deal)}
                      className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card ${
                        dragId === deal.id ? "opacity-50" : ""
                      }`}
                    >
                      <p className="text-sm font-bold leading-snug text-brand-950">
                        {deal.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {dealSubtitle(deal)}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-brand-950">
                          {money(deal.amount)}
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {deal.probability}%
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <span className="text-[11px] font-medium text-slate-500">
                          {deal.owner}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {shortDate(deal.expectedCloseDate)}
                        </span>
                      </div>
                    </article>
                  ))}

                  {columnDeals.length === 0 && (
                    <button
                      type="button"
                      onClick={() => openCreate(stage.key)}
                      className="w-full rounded-xl border border-dashed border-slate-300 py-6 text-xs font-semibold text-slate-400 transition hover:border-brand-300 hover:text-brand-500"
                    >
                      Drop a deal here or add one
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 sm:p-8">
          <form
            onSubmit={submit}
            className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-brand-950">
                  {modal === "edit" ? "Edit deal" : "New deal"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Deal details sync to the pipeline immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className={LABEL}>Deal title *</span>
                <input
                  required
                  className={FIELD}
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  placeholder="Acme Corp — CRM rollout"
                />
              </label>
              <label>
                <span className={LABEL}>Amount (₦)</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  className={FIELD}
                  value={form.amount}
                  onChange={(event) => update("amount", event.target.value)}
                  placeholder="25000"
                />
              </label>
              <label>
                <span className={LABEL}>Stage</span>
                <select
                  className={FIELD}
                  value={form.stage}
                  onChange={(event) => update("stage", event.target.value as StageKey)}
                >
                  {STAGES.map((stage) => (
                    <option key={stage.key} value={stage.key}>
                      {stage.label}
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
                <span className={LABEL}>Company</span>
                <select
                  className={FIELD}
                  value={form.companyId}
                  onChange={(event) => update("companyId", event.target.value)}
                >
                  <option value="">— none —</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Owner</span>
                <select
                  className={FIELD}
                  value={form.owner}
                  onChange={(event) => update("owner", event.target.value)}
                >
                  {OWNERS.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Source</span>
                <select
                  className={FIELD}
                  value={form.source}
                  onChange={(event) => update("source", event.target.value)}
                >
                  {SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Expected close</span>
                <input
                  type="date"
                  className={FIELD}
                  value={form.expectedCloseDate}
                  onChange={(event) => update("expectedCloseDate", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Probability %</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className={FIELD}
                  value={form.probability}
                  onChange={(event) => update("probability", event.target.value)}
                />
              </label>
              <label className="sm:col-span-2">
                <span className={LABEL}>Notes</span>
                <textarea
                  rows={3}
                  className={FIELD}
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  placeholder="Next steps, blockers, stakeholders…"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Saving…" : modal === "edit" ? "Save changes" : "Create deal"}
              </button>
              {modal === "edit" && editingId && (
                <button
                  type="button"
                  onClick={() => void remove(editingId)}
                  className="rounded-xl border border-coral-400/40 px-5 py-3 text-sm font-bold text-coral-400 transition hover:bg-coral-400/10"
                >
                  Delete deal
                </button>
              )}
              <button
                type="button"
                onClick={() => setModal(null)}
                className="ml-auto text-sm font-semibold text-slate-500 hover:text-brand-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}
    </div>
  );
}
