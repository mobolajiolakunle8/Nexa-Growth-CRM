"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  OWNERS,
  type CompanyRecord,
  type ContactRecord,
  apiSend,
  initials,
  shortDate,
} from "@/lib/types";

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const STAGE_LABELS: Record<string, { label: string; className: string }> = {
  lead: { label: "Lead", className: "bg-sky-50 text-sky-600" },
  qualified: { label: "Qualified", className: "bg-indigo-50 text-indigo-600" },
  opportunity: { label: "Opportunity", className: "bg-amber-50 text-amber-600" },
  customer: { label: "Customer", className: "bg-emerald-50 text-emerald-600" },
  churned: { label: "Churned", className: "bg-slate-100 text-slate-500" },
};

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

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  companyId: string;
  source: string;
  stage: string;
  owner: string;
  tags: string;
};

const EMPTY: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  companyId: "",
  source: "Website",
  stage: "lead",
  owner: OWNERS[0],
  tags: "",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contactRes, companyRes] = await Promise.all([
        fetch("/api/crm/contacts", { cache: "no-store" }),
        fetch("/api/crm/companies", { cache: "no-store" }),
      ]);
      const [contactData, companyData] = (await Promise.all([
        contactRes.json(),
        companyRes.json(),
      ])) as { data: unknown }[];
      setContacts((contactData.data ?? []) as ContactRecord[]);
      setCompanies((companyData.data ?? []) as CompanyRecord[]);
      setError("");
    } catch {
      setError("Could not load contacts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial) setQuery(initial);
  }, [load]);

  const companyNameById = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesStage = stageFilter === "all" || contact.stage === stageFilter;
      if (!matchesStage) return false;
      if (!term) return true;
      const haystack = [
        contact.firstName,
        contact.lastName,
        contact.email ?? "",
        contact.phone ?? "",
        contact.position ?? "",
        companyNameById.get(contact.companyId ?? -1) ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [contacts, query, stageFilter, companyNameById]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY);
    setEditingId(null);
    setModal("create");
  }

  function openEdit(contact: ContactRecord) {
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email ?? "",
      phone: contact.phone ?? "",
      position: contact.position ?? "",
      companyId: contact.companyId ? String(contact.companyId) : "",
      source: contact.source,
      stage: contact.stage,
      owner: contact.owner,
      tags: contact.tags ?? "",
    });
    setEditingId(contact.id);
    setModal("edit");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      companyId: form.companyId ? Number(form.companyId) : null,
    };
    try {
      if (modal === "edit" && editingId) {
        await apiSend(`/api/crm/contacts/${editingId}`, "PATCH", payload);
      } else {
        await apiSend("/api/crm/contacts", "POST", payload);
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
    await apiSend(`/api/crm/contacts/${id}`, "DELETE");
    setModal(null);
    await load();
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            CRM · Contacts
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Contacts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {contacts.length} people · {companies.length} companies in the database
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          + New contact
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, phone or company"
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        />
        <select
          value={stageFilter}
          onChange={(event) => setStageFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-400"
        >
          <option value="all">All lifecycle stages</option>
          {Object.keys(STAGE_LABELS).map((stage) => (
            <option key={stage} value={stage}>
              {STAGE_LABELS[stage].label}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-500">
          {filtered.length} shown
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Stage</th>
                <th className="px-4 py-3 font-semibold">Owner</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Added</th>
                <th className="px-6 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((contact) => {
                const stage = STAGE_LABELS[contact.stage] ?? STAGE_LABELS.lead;
                return (
                  <tr key={contact.id} className="hover:bg-brand-50/40">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-400 text-xs font-bold text-white">
                          {initials(`${contact.firstName} ${contact.lastName}`)}
                        </span>
                        <div>
                          <p className="font-semibold text-brand-950">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {contact.email ?? "no email"} · {contact.phone ?? "no phone"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {contact.companyId
                        ? companyNameById.get(contact.companyId) ?? "—"
                        : "—"}
                      <span className="block text-xs text-slate-400">
                        {contact.position ?? ""}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${stage.className}`}
                      >
                        {stage.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{contact.owner}</td>
                    <td className="px-4 py-3.5 text-slate-600">{contact.source}</td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {shortDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(contact)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-brand-600 transition hover:bg-brand-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(contact.id)}
                        className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-400 transition hover:bg-coral-400/10 hover:text-coral-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-sm text-slate-500">
                    No contacts match your filters yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 sm:p-8">
          <form
            onSubmit={submit}
            className="w-full max-w-2xl rounded-3xl bg-white p-7 shadow-soft"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-brand-950">
                  {modal === "edit" ? "Edit contact" : "New contact"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stored in PostgreSQL, linked to companies and deals.
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
              <label>
                <span className={LABEL}>First name *</span>
                <input
                  required
                  className={FIELD}
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Last name</span>
                <input
                  className={FIELD}
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Email</span>
                <input
                  type="email"
                  className={FIELD}
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Phone</span>
                <input
                  className={FIELD}
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Job title</span>
                <input
                  className={FIELD}
                  value={form.position}
                  onChange={(event) => update("position", event.target.value)}
                />
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
                <span className={LABEL}>Lifecycle stage</span>
                <select
                  className={FIELD}
                  value={form.stage}
                  onChange={(event) => update("stage", event.target.value)}
                >
                  {Object.keys(STAGE_LABELS).map((stage) => (
                    <option key={stage} value={stage}>
                      {STAGE_LABELS[stage].label}
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
                <span className={LABEL}>Tags (comma separated)</span>
                <input
                  className={FIELD}
                  value={form.tags}
                  onChange={(event) => update("tags", event.target.value)}
                  placeholder="enterprise, warm"
                />
              </label>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Saving…" : modal === "edit" ? "Save contact" : "Create contact"}
              </button>
              {modal === "edit" && editingId && (
                <button
                  type="button"
                  onClick={() => void remove(editingId)}
                  className="rounded-xl border border-coral-400/40 px-5 py-3 text-sm font-bold text-coral-400 transition hover:bg-coral-400/10"
                >
                  Delete contact
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
    </div>
  );
}
