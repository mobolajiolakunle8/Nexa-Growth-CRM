"use client";

import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/types";
import { Logo } from "@/components/brand";

type Product = {
  id: number;
  name: string;
  interval: string;
  price: string;
} | null;

export default function CheckoutPay({
  token,
  product,
  status,
  amount,
  email,
}: {
  token: string;
  product: Product;
  status: string;
  amount: string;
  email: string | null;
}) {
  const [form, setForm] = useState({
    name: "",
    email: email ?? "",
    card: "4242 4242 4242 4242",
    exp: "12/29",
    cvc: "123",
  });
  const [state, setState] = useState<"idle" | "paying" | "done" | "error">(
    status === "completed" ? "done" : "idle",
  );
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("paying");
    setError("");
    try {
      const response = await fetch("/api/channels/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fulfil_checkout",
          token,
          email: form.email,
          name: form.name,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Payment failed");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setError("Network error.");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-14">
      <div className="mx-auto max-w-lg px-4">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Test mode
          </span>
        </div>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div className="border-b border-slate-100 p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Pay {product?.name ?? "NexagrowthCRM"}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-brand-950">
              {money(amount)}
              {product && product.interval !== "one_time" && (
                <span className="ml-1 text-sm font-semibold text-slate-500">
                  / {product.interval}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-slate-400 break-all">Session {token}</p>
          </div>
          {state === "done" ? (
            <div className="p-8 text-center">
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h1 className="mt-4 text-xl font-extrabold text-brand-950">
                Payment received
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                A receipt was written to the Stripe desk and the linked deal was
                closed won.
              </p>
              <Link
                href="/app/crm/integrations/stripe"
                className="mt-6 inline-flex rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white"
              >
                Back to Stripe desk
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4 p-6">
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Cardholder name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Card number
                </span>
                <input
                  value={form.card}
                  onChange={(event) => setForm((prev) => ({ ...prev, card: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Expiry
                  </span>
                  <input
                    value={form.exp}
                    onChange={(event) => setForm((prev) => ({ ...prev, exp: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    CVC
                  </span>
                  <input
                    value={form.cvc}
                    onChange={(event) => setForm((prev) => ({ ...prev, cvc: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </label>
              </div>
              {error && (
                <p className="rounded-xl bg-coral-400/10 px-4 py-3 text-sm text-coral-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={state === "paying"}
                className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                {state === "paying" ? "Charging card…" : `Pay ${money(amount)}`}
              </button>
              <p className="text-center text-[11px] text-slate-400">
                Test card 4242 · any expiry · any CVC. No real charge is made.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
