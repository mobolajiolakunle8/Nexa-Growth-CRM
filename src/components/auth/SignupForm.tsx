"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  AuthDivider,
  GoogleButton,
  authField,
  authLabel,
} from "@/components/auth/AuthShell";
import { friendlyAuthError } from "@/lib/firebase/client";

const PLANS = ["free", "basic", "standard", "professional", "enterprise"];

export default function SignupForm() {
  const { signUp, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const planParam = params.get("plan");
  const next = params.get("next") || "/app/crm";

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    company: "",
    phone: "",
    plan: planParam && PLANS.includes(planParam) ? planParam : "professional",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.password.length < 6) {
      setError("Choose a password with at least 6 characters.");
      return;
    }
    setBusy("email");
    setError("");
    try {
      await signUp(form);
      // also record the trial request so it appears in Website leads
      void fetch("/api/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.displayName || form.email,
          email: form.email,
          company: form.company,
          phone: form.phone,
          plan: form.plan,
          message: "Created a Firebase account from the signup page.",
        }),
      });
      router.replace(next);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : undefined;
      setError(friendlyAuthError(code, "Could not create your account."));
    } finally {
      setBusy(null);
    }
  }

  async function google() {
    setBusy("google");
    setError("");
    try {
      await signInWithGoogle();
      router.replace(next);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : undefined;
      setError(friendlyAuthError(code, "Google sign-up failed."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <GoogleButton
        onClick={google}
        disabled={busy !== null}
        label={busy === "google" ? "Opening Google…" : "Sign up with Google"}
      />
      <AuthDivider />

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className={authLabel}>Full name</span>
          <input
            required
            className={authField}
            value={form.displayName}
            onChange={(event) => update("displayName", event.target.value)}
            placeholder="Amara Okafor"
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
            className={authField}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            placeholder="At least 6 characters"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={authLabel}>Company</span>
            <input
              className={authField}
              value={form.company}
              onChange={(event) => update("company", event.target.value)}
              placeholder="Company Ltd"
            />
          </label>
          <label className="block">
            <span className={authLabel}>Phone</span>
            <input
              className={authField}
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              placeholder="+234 802 000 0134"
            />
          </label>
        </div>
        <div>
          <span className={authLabel}>Plan</span>
          <div className="flex flex-wrap gap-2">
            {PLANS.map((plan) => (
              <button
                key={plan}
                type="button"
                onClick={() => update("plan", plan)}
                className={`rounded-xl border px-3.5 py-2 text-xs font-bold capitalize transition ${
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

        {error && (
          <p className="rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy !== null}
          className="w-full rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {busy === "email" ? "Creating workspace…" : "Create my free workspace"}
        </button>
        <p className="text-center text-xs text-slate-500">
          No credit card required. 14-day trial of every feature.
        </p>
      </form>
    </div>
  );
}
