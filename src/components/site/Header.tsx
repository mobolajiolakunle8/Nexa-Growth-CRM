"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, btnAqua } from "@/components/brand";
import { useAuth } from "@/components/auth/AuthProvider";

type NavGroup = {
  label: string;
  columns: { heading: string; items: { title: string; desc: string; href: string }[] }[];
};

const NAV: NavGroup[] = [
  {
    label: "Tools",
    columns: [
      {
        heading: "Sell",
        items: [
          {
            title: "CRM & Sales Pipeline",
            desc: "Leads, deals, quotes and telephony in one view.",
            href: "/app/crm",
          },
          {
            title: "Sales Intelligence",
            desc: "Repeatable sales scripts and revenue forecasting.",
            href: "/#sales-intelligence",
          },
          {
            title: "Omni-channel Contact Center",
            desc: "Calls, WhatsApp, chat, email and socials.",
            href: "/#contact-center",
          },
        ],
      },
      {
        heading: "Deliver",
        items: [
          {
            title: "Tasks & Projects",
            desc: "Kanban, Gantt, workloads and time tracking.",
            href: "/app/crm/tasks",
          },
          {
            title: "Sites, Stores & CRM Forms",
            desc: "Build landing pages that write straight to CRM.",
            href: "/#sites",
          },
          {
            title: "Invoicing & Documents",
            desc: "Quotes to cash without leaving the deal.",
            href: "/#documents",
          },
        ],
      },
      {
        heading: "Scale",
        items: [
          {
            title: "HR & Employee Management",
            desc: "Org structure, absence and work time.",
            href: "/#hr",
          },
          {
            title: "Business Processes",
            desc: "No-code automation designer with 400+ triggers.",
            href: "/#automation",
          },
          {
            title: "BI & Analytics",
            desc: "40+ dashboards plus your own SQL reports.",
            href: "/app/crm",
          },
        ],
      },
    ],
  },
  {
    label: "Solutions",
    columns: [
      {
        heading: "By team",
        items: [
          { title: "Sales teams", desc: "Close faster with pipeline automation.", href: "/#sales-intelligence" },
          { title: "Marketing teams", desc: "Campaigns, landing pages, attribution.", href: "/#marketing" },
          { title: "Support teams", desc: "SLA-driven service desk and helpdesk.", href: "/#contact-center" },
        ],
      },
      {
        heading: "By size",
        items: [
          { title: "Startups", desc: "Free CRM for up to 5 users forever.", href: "/pricing" },
          { title: "Mid-market", desc: "Automation plus BI that scales to 250 seats.", href: "/pricing" },
          { title: "Enterprise", desc: "Private cloud, SSO, audit and 24/7 support.", href: "/pricing" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    columns: [
      {
        heading: "Learn",
        items: [
          { title: "Academy & courses", desc: "Free certification for your team.", href: "/#faq" },
          { title: "Webinars", desc: "Live product tours every Thursday.", href: "/#faq" },
          { title: "Marketplace", desc: "Connect apps, webhooks and inbound tokens.", href: "/integrations" },
        ],
      },
    ],
  },
];

export default function Header() {
  const { user } = useAuth();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition ${
        scrolled
          ? "border-slate-200/80 bg-white/90 backdrop-blur-xl"
          : "border-transparent bg-white"
      }`}
      onMouseLeave={() => setOpen(null)}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((group) => (
            <div key={group.label} className="relative">
              <button
                type="button"
                onMouseEnter={() => setOpen(group.label)}
                onClick={() => setOpen(open === group.label ? null : group.label)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[15px] font-semibold transition ${
                  open === group.label
                    ? "bg-brand-50 text-brand-600"
                    : "text-slate-700 hover:text-brand-600"
                }`}
              >
                {group.label}
                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ))}
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-[15px] font-semibold text-slate-700 transition hover:text-brand-600"
          >
            Pricing
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="text-[13px] font-semibold text-slate-500">
                {user.displayName || user.email}
              </span>
              <Link href="/app/crm" className={btnAqua + " !px-4 !py-2.5"}>
                Open workspace
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[15px] font-semibold text-slate-700 transition hover:text-brand-600"
              >
                Log in
              </Link>
              <Link href="/signup" className={btnAqua + " !px-4 !py-2.5"}>
                Start free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobile((value) => !value)}
          aria-label="Toggle navigation"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-brand-900 lg:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path
              d={mobile ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="hidden border-t border-slate-100 bg-white shadow-soft lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-8 md:grid-cols-3">
            {NAV.find((group) => group.label === open)?.columns.map((column) => (
              <div key={column.heading}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {column.heading}
                </p>
                <ul className="space-y-1">
                  {column.items.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(null)}
                        className="block rounded-xl px-3 py-2.5 transition hover:bg-brand-50"
                      >
                        <span className="block text-sm font-semibold text-brand-950">
                          {item.title}
                        </span>
                        <span className="block text-[13px] leading-snug text-slate-500">
                          {item.desc}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {mobile && (
        <div className="border-t border-slate-100 bg-white px-4 pb-6 lg:hidden">
          {NAV.map((group) => (
            <div key={group.label} className="border-b border-slate-100 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {group.label}
              </p>
              <ul className="mt-2 space-y-1">
                {group.columns
                  .flatMap((column) => column.items)
                  .map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setMobile(false)}
                        className="block rounded-lg px-2 py-2 text-sm font-medium text-slate-700"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
          <div className="mt-4 flex items-center gap-3">
            <Link
              href="/pricing"
              onClick={() => setMobile(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold"
            >
              Pricing
            </Link>
            <Link
              href={user ? "/app/crm" : "/signup"}
              onClick={() => setMobile(false)}
              className="flex-1 rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {user ? "Open workspace" : "Start free"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
