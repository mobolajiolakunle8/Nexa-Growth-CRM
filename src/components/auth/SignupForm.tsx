"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { authField, authLabel } from "@/components/auth/AuthShell";

export default function SignupForm() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    workspaceName: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/app/crm");
  }, [loading, user, router]);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signUp(form);
      router.replace("/app/crm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the workspace.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className={authLabel}>Your name</span>
        <input
          required
          className={authField}
          value={form.displayName}
          onChange={(event) => update("displayName", event.target.value)}
          placeholder="Amara Okafor"
        />
      </label>
      <label className="block">
        <span className={authLabel}>Workspace name</span>
        <input
          required
          className={authField}
          value={form.workspaceName}
          onChange={(event) => update("workspaceName", event.target.value)}
          placeholder="Northwind Nigeria"
        />
      </label>
      <label className="block">
        <span className={authLabel}>Work email</span>
        <input
          required
          type="email"
          autoComplete="email"
          className={authField}
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          placeholder="you@company.com"
        />
      </label>
      <label className="block">
        <span className={authLabel}>Password</span>
        <input
          required
          type="password"
          autoComplete="new-password"
          minLength={8}
          className={authField}
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="At least 8 characters"
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
        {busy ? "Creating workspace…" : "Create workspace"}
      </button>
      <p className="text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-brand-600">
          Log in
        </Link>
      </p>
    </form>
  );
}
