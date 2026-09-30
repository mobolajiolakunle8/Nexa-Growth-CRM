"use client";

import { useState } from "react";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/components/auth/AuthProvider";
import { authField, authLabel } from "@/components/auth/AuthShell";
import { friendlyAuthError } from "@/lib/firebase/client";

export default function ResetForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("busy");
    setError("");
    try {
      await resetPassword(email);
      setState("sent");
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : undefined;
      setError(friendlyAuthError(code, "Could not send the reset email."));
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center">
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
        <h2 className="mt-4 text-lg font-extrabold text-brand-950">
          Check your inbox
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          If an account exists for <strong>{email}</strong>, a password reset
          link is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className={authLabel}>Work email</span>
        <input
          required
          type="email"
          className={authField}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
        />
      </label>
      {error && (
        <p className="rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "busy"}
        className="w-full rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {state === "busy" ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
