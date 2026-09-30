"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Logo } from "@/components/brand";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
            Checking your session…
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Logo />
          <h1 className="mt-6 text-xl font-extrabold text-brand-950">
            Sign in to continue
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            The NexagrowthCRM workspace is protected by Firebase Authentication.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(pathname)}`}
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white"
          >
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
