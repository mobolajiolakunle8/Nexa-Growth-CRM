"use client";

import Link from "next/link";
import { useState } from "react";

const TEAM_SIZES = ["1-5", "6-20", "21-50", "51-200", "200+"];
const PLANS = ["free", "basic", "standard", "professional", "enterprise"];

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export default function TrialForm({ initialPlan }: { initialPlan: string }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    company: "",
    phone: "",
    teamSize: "6-20",
    plan: initialPlan,
    message: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("loading");
    setError("");
    const response = await fetch("/api/trial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { error?: string };
    if (response.ok) {
      setState("done");
    } else {
      setState("idle");
      setError(payload.error ?? "Something went wrong. Try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-3xl border border-mint-400/40 bg-white p-8 text-center shadow-card">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint-400/15 text-emerald-600">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-brand-950">
          Your workspace is being prepared
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          We sent a confirmation to <strong>{form.email}</strong>. Meanwhile,
          jump straight into the fully loaded demo CRM with sample deals,
          contacts and tasks.
        </p>
        <Link
          href="/app/crm"
          className="mt-7 inline-flex rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600"
        >
          Open NexagrowthCRM demo
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-card"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Full name *
          </span>
          <input
            required
            className={FIELD}
            value={form.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            placeholder="Alex Morgan"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Work email *
          </span>
          <input
            required
            type="email"
            className={FIELD}
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            placeholder="alex@company.com"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Company
          </span>
          <input
            className={FIELD}
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            placeholder="Company Inc."
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Phone
          </span>
          <input
            className={FIELD}
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="+234 802 000 0134"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Team size
          </span>
          <select
            className={FIELD}
            value={form.teamSize}
            onChange={(event) => update("teamSize", event.target.value)}
          >
            {TEAM_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} people
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Plan
          </span>
          <div className="flex flex-wrap gap-2">
            {PLANS.map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => update("plan", plan)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold capitalize transition ${
                  form.plan === plan
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-500 hover:border-brand-300"
                }`}
              >
                {plan}
              </button>
            ))}
          </div>
        </div>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            What do you want to improve first?
          </span>
          <textarea
            rows={3}
            className={FIELD}
            value={form.message}
            onChange={(event) => update("message", event.target.value)}
            placeholder="We need pipeline automation and WhatsApp for the sales team…"
          />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-6 w-full rounded-xl bg-brand-500 px-6 py-4 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {state === "loading" ? "Creating workspace…" : "Create my free workspace"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        No credit card required. Your requests are stored in our CRM demo
        database so you can see lead capture in action.
      </p>
    </form>
  );
}
