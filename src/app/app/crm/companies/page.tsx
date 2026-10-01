"use client";

import { useCallback, useEffect, useState } from "react";
import {
  OWNERS,
  type CompanyRecord,
  apiSend,
  initials,
  money,
} from "@/lib/types";

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const LABEL = "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const INDUSTRIES = [
  "Data & Analytics",
  "Transport & Logistics",
  "Healthcare",
  "Industrial",
  "Retail & E-commerce",
  "Financial Services",
  "Education",
  "Software",
  "Other",
];

const SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

const TONES = [
  "from-brand-500 to-aqua-400",
  "from-violet-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-coral-400 to-rose-500",
];

type FormState = {
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  employees: string;
  annualRevenue: string;
  owner: string;
  notes: string;
};

const EMPTY: FormState = {
  name: "",
  industry: "Software",
  website: "",
  phone: "",
  email: "",
  address: "",
  employees: "11-50",
  annualRevenue: "",
  owner: OWNERS[0],
  notes: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/crm/companies", { cache: "no-store" });
      const data = (await response.json()) as { data: unknown };
      setCompanies((data.data ?? []) as CompanyRecord[]);
      setError("");
    } catch {
      setError("Could not load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = companies.filter((company) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return [company.name, company.industry, company.email ?? "", company.website ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreate() {
    setForm(EMPTY);
    setEditingId(null);
    setModal("create");
  }

  function openEdit(company: CompanyRecord) {
    setForm({
      name: company.name,
      industry: company.industry,
      website: company.website ?? "",
      phone: company.phone ?? "",
      email: company.email ?? "",
      address: company.address ?? "",
      employees: company.employees ?? "11-50",
      annualRevenue: String(Number(company.annualRevenue)),
      owner: company.owner,
      notes: company.notes ?? "",
    });
    setEditingId(company.id);
    setModal("edit");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form, annualRevenue: Number(form.annualRevenue || 0) };
    try {
      if (modal === "edit" && editingId) {
        await apiSend(`/api/crm/companies/${editingId}`, "PATCH", payload);
      } else {
        await apiSend("/api/crm/companies", "POST", payload);
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
    await apiSend(`/api/crm/companies/${id}`, "DELETE");
    setModal(null);
    await load();
  }

  const totalRevenue = companies.reduce(
    (sum, company) => sum + Number(company.annualRevenue),
    0,
  );

  return (
    <div className="px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
            CRM · Companies
          </p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
            Companies
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {companies.length} accounts in this workspace
            annual revenue
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          + New company
        </button>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search companies"
        className="mt-6 w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
      />

      {error && (
        <p className="mt-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((company, index) => (
          <article
            key={company.id}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
          >
            <div className="flex items-start gap-3">
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${
                  TONES[index % TONES.length]
                } text-sm font-bold text-white`}
              >
                {initials(company.name)}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-bold text-brand-950">
                  {company.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {company.industry} · {company.employees} employees
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                {company.owner.split(" ")[0]}
              </span>
            </div>

            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Annual revenue</dt>
                <dd className="font-bold text-brand-950">
                  {company.industry}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Website</dt>
                <dd className="truncate font-medium text-brand-600">
                  {company.website ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate font-medium text-slate-700">
                  {company.email ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Phone</dt>
                <dd className="truncate font-medium text-slate-700">
                  {company.phone ?? "—"}
                </dd>
              </div>
            </dl>

            {company.notes && (
              <p className="mt-4 rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-600">
                {company.notes}
              </p>
            )}

            <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => openEdit(company)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50"
              >
                Edit account
              </button>
              <button
                type="button"
                onClick={() => void remove(company.id)}
                className="rounded-lg px-3 py-2 text-xs font-bold text-slate-400 transition hover:bg-coral-400/10 hover:text-coral-400"
              >
                Delete
              </button>
            </div>
          </article>
        ))}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
            No companies found. Create your first account.
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white"
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
                  {modal === "edit" ? "Edit company" : "New company"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Account record for the CRM.
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
                <span className={LABEL}>Company name *</span>
                <input
                  required
                  className={FIELD}
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                />
              </label>
              <label>
                <span className={LABEL}>Industry</span>
                <select
                  className={FIELD}
                  value={form.industry}
                  onChange={(event) => update("industry", event.target.value)}
                >
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Employees</span>
                <select
                  className={FIELD}
                  value={form.employees}
                  onChange={(event) => update("employees", event.target.value)}
                >
                  {SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={LABEL}>Website</span>
                <input
                  className={FIELD}
                  value={form.website}
                  onChange={(event) => update("website", event.target.value)}
                  placeholder="company.com"
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
              <label className="sm:col-span-2">
                <span className={LABEL}>Address</span>
                <input
                  className={FIELD}
                  value={form.address}
                  onChange={(event) => update("address", event.target.value)}
                />
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
              <label className="sm:col-span-2">
                <span className={LABEL}>Notes</span>
                <textarea
                  rows={3}
                  className={FIELD}
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </label>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Saving…" : modal === "edit" ? "Save company" : "Create company"}
              </button>
              {modal === "edit" && editingId && (
                <button
                  type="button"
                  onClick={() => void remove(editingId)}
                  className="rounded-xl border border-coral-400/40 px-5 py-3 text-sm font-bold text-coral-400 transition hover:bg-coral-400/10"
                >
                  Delete company
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
