"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/brand";
import { useAuth } from "@/components/auth/AuthProvider";
import { initials } from "@/lib/types";

const NAV = [
  {
    heading: "Revenue",
    items: [
      { label: "Dashboard", href: "/app/crm", icon: "M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-4H4v4Zm10-11h6V4h-6v5Z" },
      { label: "Pipeline", href: "/app/crm/deals", icon: "M4 6h5v12H4zM10 6h5v8h-5zM16 6h4v5h-4z" },
      { label: "Contacts", href: "/app/crm/contacts", icon: "M16 14a4 4 0 10-8 0M12 10a3 3 0 100-6 3 3 0 000 6ZM4 20c1.5-3 4.5-4 8-4s6.5 1 8 4" },
      { label: "Companies", href: "/app/crm/companies", icon: "M4 20V7l6-3v16M10 20h10V11l-10-4M14 14h2M14 17h2" },
      { label: "Website leads", href: "/app/crm/leads", icon: "M3 12l9-8 9 8M5 10v10h14V10" },
    ],
  },
  {
    heading: "Work",
    items: [
      { label: "Tasks & Projects", href: "/app/crm/tasks", icon: "M5 7l3 3 5-5M4 17h16M4 21h16" },
      { label: "Activity timeline", href: "/app/crm/activity", icon: "M12 8v5l3 2M12 3a9 9 0 100 18 9 9 0 000-18Z" },
    ],
  },
  {
    heading: "Platform",
    items: [
      { label: "Integrations", href: "/app/crm/integrations", icon: "M8 8h3v3H8zM13 8h3v3h-3zM8 13h3v3H8zM13 13h3v3h-3zM4 4h16v16H4z" },
      { label: "Slack", href: "/app/crm/integrations/slack", icon: "M8 8h3v3H8zM13 13h3v3h-3zM8 13h3v3H8zM13 8h3v3h-3z" },
      { label: "WhatsApp", href: "/app/crm/integrations/whatsapp", icon: "M5 6h14v9H8l-3 3V6z" },
      { label: "Stripe", href: "/app/crm/integrations/stripe", icon: "M4 8h16v8H4zM4 12h16" },
      { label: "Shopify", href: "/app/crm/integrations/shopify", icon: "M6 7l6-3 6 3v10l-6 3-6-3V7z" },
      { label: "Microsoft 365", href: "/app/crm/integrations/microsoft", icon: "M4 6h7v12H4zM13 8h7v10h-7z" },
      { label: "Account & team", href: "/app/crm/account", icon: "M12 12a4 4 0 100-8 4 4 0 000 8ZM5 20c1.2-3 3.9-4.5 7-4.5s5.8 1.5 7 4.5" },
      { label: "Deployment", href: "/app/crm/deployment", icon: "M12 3l9 16H3l9-16Z" },
    ],
  },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const accountName =
    profile?.displayName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Workspace user";
  const accountEmail = profile?.email ?? user?.email ?? null;
  const photoUrl = profile?.photoUrl ?? user?.photoURL ?? null;
  const roleLabel = profile?.role === "owner" ? "Workspace owner" : "Member";

  function search(event: React.FormEvent) {
    event.preventDefault();
    router.push(`/app/crm/contacts?q=${encodeURIComponent(query)}`);
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 border-r border-brand-900/40 bg-brand-950 px-4 py-5 text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="flex items-center px-2">
          <Logo invert />
        </Link>

        <nav className="mt-8 space-y-6">
          {NAV.map((group) => (
            <div key={group.heading}>
              <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                {group.heading}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/app/crm/integrations"
                      ? pathname === item.href
                      : pathname === item.href ||
                        (item.href !== "/app/crm" && pathname.startsWith(item.href));
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-white/12 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
                          <path
                            d={item.icon}
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="rounded-2xl bg-gradient-to-br from-brand-600/60 to-aqua-500/30 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-aqua-400">
              Trial · 11 days left
            </p>
            <p className="mt-1.5 text-sm font-semibold text-white">
              Professional workspace
            </p>
            <Link
              href="/pricing"
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-xs font-bold text-brand-700"
            >
              Upgrade plan
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={accountName}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aqua-400 to-brand-500 text-xs font-bold text-white">
              {initials(accountName)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{accountName}</p>
            <p className="truncate text-[11px] text-white/50">
              {accountEmail ?? roleLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-white/60 transition hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M15 12H4m0 0 3-3m-3 3 3 3M11 5h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-brand-950/50 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-900 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          <form onSubmit={search} className="relative hidden max-w-md flex-1 sm:block">
            <svg
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts, deals, companies…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/app/crm/tasks"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-brand-600 sm:inline-flex"
            >
              My tasks
            </Link>
            <span
              title={accountEmail ?? accountName}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700"
            >
              {initials(accountName)}
            </span>
          </div>
        </header>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
