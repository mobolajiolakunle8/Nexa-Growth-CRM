"use client";

import Link from "next/link";

export default function ResetForm() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm leading-relaxed text-slate-600">
        Password reset by email is turned off. Sign in with the password you
        chose when you created the workspace, or create a new workspace.
      </p>
      <Link
        href="/signup"
        className="mt-5 inline-flex rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white"
      >
        Create a workspace
      </Link>
    </div>
  );
}
