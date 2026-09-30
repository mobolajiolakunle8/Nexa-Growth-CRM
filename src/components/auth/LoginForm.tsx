"use client";

import Link from "next/link";
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

export default function LoginForm() {
  const { signIn, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/app/crm";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [loading, user, router, next]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy("email");
    setError("");
    try {
      await signIn(form.email, form.password);
      router.replace(next);
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : undefined;
      setError(friendlyAuthError(code, "Could not sign you in."));
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
      setError(friendlyAuthError(code, "Google sign-in failed."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <GoogleButton
        onClick={google}
        disabled={busy !== null}
        label={busy === "google" ? "Opening Google…" : "Continue with Google"}
      />
      <AuthDivider />

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className={authLabel}>Work email</span>
          <input
            required
            type="email"
            autoComplete="email"
            className={authField}
            value={form.email}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, email: event.target.value }))
            }
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
            onChange={(event) =>
              setForm((prev) => ({ ...prev, password: event.target.value }))
            }
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-coral-400/10 px-4 py-3 text-sm font-medium text-coral-400">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-xs font-bold text-brand-600 hover:text-brand-800"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={busy !== null}
          className="w-full rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-600 disabled:opacity-60"
        >
          {busy === "email" ? "Signing in…" : "Sign in to workspace"}
        </button>
      </form>
    </div>
  );
}
