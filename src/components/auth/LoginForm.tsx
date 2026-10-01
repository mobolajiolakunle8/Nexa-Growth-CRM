"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { authField, authLabel } from "@/components/auth/AuthShell";

export default function LoginForm() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app/crm";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(form.email, form.password);
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className={authLabel}>Work email</span>
        <input
          required
          type="email"
          autoComplete="email"
          className={authField}
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="you@company.com"
        />
      </label>
      <label className="block">
        <span className={authLabel}>Password</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          className={authField}
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Your password"
        />
      </label>
      {error && (
        <p className="rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/signup" className="font-bold text-brand-600">
          Create a workspace
        </Link>
      </p>
    </form>
  );
}
