"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AccountPanel() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="px-4 py-10 lg:px-8">
      <h1 className="text-2xl font-extrabold text-brand-950">Workspace</h1>
      <p className="mt-2 text-sm text-slate-500">
        {user?.workspaceName} · {user?.email}
      </p>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.replace("/login");
        }}
        className="mt-6 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
      >
        Sign out
      </button>
    </div>
  );
}
