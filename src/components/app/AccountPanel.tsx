"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { initials } from "@/lib/types";

type TeamMember = {
  id: number;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  provider: string;
  role: string;
  emailVerified: boolean;
  lastLoginAt: string;
  createdAt: string;
};

const FIELD =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-brand-950 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100";
const LABEL =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const PROVIDER_LABEL: Record<string, string> = {
  password: "Email & password",
  "google.com": "Google",
};

function when(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-NG", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AccountPanel() {
  const { user, profile, authedFetch, refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({ displayName: "", company: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      displayName: profile?.displayName ?? user?.displayName ?? "",
      company: profile?.company ?? "",
      phone: profile?.phone ?? "",
    });
  }, [profile, user]);

  const loadTeam = useCallback(async () => {
    const response = await authedFetch("/api/auth/users");
    if (!response.ok) return;
    const payload = (await response.json()) as { data?: TeamMember[] };
    setTeam(payload.data ?? []);
  }, [authedFetch]);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setError("");
    const response = await authedFetch("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { error?: string };
    if (response.ok) {
      setNotice("Profile updated.");
      await refreshProfile();
      await loadTeam();
    } else {
      setError(payload.error ?? "Could not save.");
    }
    setBusy(false);
  }

  return (
    <div className="px-4 py-8 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-500">
          Platform · Account
        </p>
        <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-brand-950">
          Account &amp; team
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Signed in with Firebase Authentication. Profiles are mirrored into
          PostgreSQL so the CRM can assign records to real people.
        </p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-4">
              {profile?.photoUrl || user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(profile?.photoUrl ?? user?.photoURL) as string}
                  alt="Avatar"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
              ) : (
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aqua-400 to-brand-500 text-lg font-extrabold text-white">
                  {initials(
                    profile?.displayName ?? user?.displayName ?? user?.email ?? "U",
                  )}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-lg font-extrabold text-brand-950">
                  {profile?.displayName ?? user?.displayName ?? "Workspace user"}
                </p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Role</dt>
                <dd className="font-bold capitalize text-brand-950">
                  {profile?.role ?? "member"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Sign-in method</dt>
                <dd className="font-semibold text-slate-700">
                  {PROVIDER_LABEL[profile?.provider ?? ""] ??
                    profile?.provider ??
                    "password"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Email verified</dt>
                <dd
                  className={`font-bold ${
                    user?.emailVerified ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {user?.emailVerified ? "Yes" : "Pending"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500">Firebase UID</dt>
                <dd className="truncate font-mono text-[11px] text-slate-400">
                  {user?.uid}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-slate-600 transition hover:border-coral-400/40 hover:text-coral-400"
            >
              Sign out
            </button>
          </div>

          <form
            onSubmit={save}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h2 className="text-base font-extrabold text-brand-950">
              Edit profile
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className={LABEL}>Display name</span>
                <input
                  className={FIELD}
                  value={form.displayName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, displayName: event.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className={LABEL}>Company</span>
                <input
                  className={FIELD}
                  value={form.company}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, company: event.target.value }))
                  }
                />
              </label>
              <label className="block">
                <span className={LABEL}>Phone</span>
                <input
                  className={FIELD}
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+234 802 000 0134"
                />
              </label>
              {notice && (
                <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">
                  {notice}
                </p>
              )}
              {error && (
                <p className="rounded-xl bg-coral-400/10 px-4 py-2.5 text-sm text-coral-400">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-brand-500 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save profile"}
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-bold text-brand-950">
              Workspace accounts
            </h2>
            <p className="text-xs text-slate-500">
              Every Firebase user that has signed in to this workspace.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-6 py-3 font-semibold">Last login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-[11px] font-bold text-brand-700">
                          {initials(member.displayName ?? member.email ?? "U")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-brand-950">
                            {member.displayName ?? "Unnamed"}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-600">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {PROVIDER_LABEL[member.provider] ?? member.provider}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {when(member.lastLoginAt)}
                    </td>
                  </tr>
                ))}
                {team.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-10 text-center text-sm text-slate-400"
                    >
                      Loading accounts…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
