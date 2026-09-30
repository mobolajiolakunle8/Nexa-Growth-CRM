"use client";

import Link from "next/link";
import { useState } from "react";
import { sectionLabel } from "@/components/brand";
import { money } from "@/lib/types";

type Plan = {
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  users: string;
  storage: string;
  highlight?: boolean;
  features: string[];
};

const CLOUD_PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "For small teams getting organised",
    monthly: 0,
    annual: 0,
    users: "Unlimited users",
    storage: "5 GB storage",
    features: [
      "CRM with unlimited contacts & deals",
      "Tasks and projects",
      "CRM webforms",
      "Sales team collaboration chat",
      "Mobile apps for iOS and Android",
    ],
  },
  {
    name: "Basic",
    tagline: "Get your pipeline under control",
    monthly: 75000,
    annual: 60000,
    users: "5 users",
    storage: "24 GB storage",
    features: [
      "Everything in Free",
      "Email marketing (10,000 emails/mo)",
      "Quotes and invoices",
      "Sales reports & goal tracking",
      "Product catalogue",
    ],
  },
  {
    name: "Standard",
    tagline: "Automate the routine work",
    monthly: 149000,
    annual: 119000,
    users: "50 users",
    storage: "100 GB storage",
    highlight: true,
    features: [
      "Everything in Basic",
      "Automation rules & sales scripts",
      "Telephony & WhatsApp channel",
      "Landing pages and online store",
      "Time tracking & work reports",
    ],
  },
  {
    name: "Professional",
    tagline: "Run the whole company",
    monthly: 299000,
    annual: 239000,
    users: "100 users",
    storage: "1 TB storage",
    features: [
      "Everything in Standard",
      "Sales Intelligence & forecasting",
      "Business processes designer",
      "HR, workload and absence management",
      "40+ BI dashboards, custom reports",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Security, scale and control",
    monthly: 599000,
    annual: 479000,
    users: "250 users",
    storage: "3 TB storage",
    features: [
      "Everything in Professional",
      "SSO / SAML and audit logs",
      "Extended API limits & webhooks",
      "Private cloud or on-premise option",
      "Dedicated success manager, 24/7 SLA",
    ],
  },
];

const BOX_PLANS: Plan[] = [
  {
    name: "On-premise 50",
    tagline: "Self-hosted for one office",
    monthly: 2235000,
    annual: 2235000,
    users: "50 users",
    storage: "Own infrastructure",
    features: [
      "All Professional features",
      "Install on your own servers",
      "Unlimited automation rules",
      "Source code access",
    ],
  },
  {
    name: "On-premise 100",
    tagline: "Growing multi-team companies",
    monthly: 4485000,
    annual: 4485000,
    users: "100 users",
    storage: "Own infrastructure",
    highlight: true,
    features: [
      "Everything in On-premise 50",
      "Cluster-ready deployment",
      "Document generator & e-signature",
      "Priority engineering support",
    ],
  },
  {
    name: "On-premise 250",
    tagline: "Enterprise deployments",
    monthly: 8985000,
    annual: 8985000,
    users: "250 users",
    storage: "Own infrastructure",
    features: [
      "Everything in On-premise 100",
      "High availability architecture",
      "Custom SLA and migration services",
      "Named technical account manager",
    ],
  },
];

function PlanCard({ plan, annual }: { plan: Plan; annual: boolean }) {
  const price = annual ? plan.annual : plan.monthly;
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-7 transition hover:-translate-y-1 ${
        plan.highlight
          ? "border-brand-500 bg-brand-950 text-white shadow-soft"
          : "border-slate-200 bg-white"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-7 rounded-full bg-aqua-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-950">
          Most popular
        </span>
      )}
      <h3
        className={`text-lg font-extrabold ${
          plan.highlight ? "text-white" : "text-brand-950"
        }`}
      >
        {plan.name}
      </h3>
      <p
        className={`mt-1 text-sm ${
          plan.highlight ? "text-white/65" : "text-slate-500"
        }`}
      >
        {plan.tagline}
      </p>
      <div className="mt-5 flex items-end gap-1">
        <span
          className={`text-4xl font-extrabold tracking-tight ${
            plan.highlight ? "text-white" : "text-brand-950"
          }`}
        >
          {price === 0 ? "₦0" : money(price, true)}
        </span>
        <span
          className={`pb-1.5 text-sm ${
            plan.highlight ? "text-white/60" : "text-slate-500"
          }`}
        >
          /month
        </span>
      </div>
      <p
        className={`mt-1 text-xs ${
          plan.highlight ? "text-aqua-400" : "text-brand-600"
        }`}
      >
        {annual ? "billed annually · save 20%" : "billed monthly"}
      </p>

      <div
        className={`mt-5 space-y-1 rounded-2xl px-4 py-3 text-sm ${
          plan.highlight ? "bg-white/10" : "bg-slate-50"
        }`}
      >
        <p
          className={`font-bold ${plan.highlight ? "text-white" : "text-brand-900"}`}
        >
          {plan.users}
        </p>
        <p className={plan.highlight ? "text-white/60" : "text-slate-500"}>
          {plan.storage}
        </p>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                plan.highlight ? "bg-aqua-400/20 text-aqua-400" : "bg-brand-50 text-brand-600"
              }`}
            >
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                <path
                  d="M4 10.5l3.2 3.2L16 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={plan.highlight ? "text-white/80" : "text-slate-600"}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href={`/signup?plan=${plan.name.toLowerCase()}`}
        className={`mt-7 rounded-xl px-5 py-3 text-center text-sm font-bold transition ${
          plan.highlight
            ? "bg-aqua-400 text-brand-950 hover:bg-white"
            : "bg-brand-500 text-white hover:bg-brand-600"
        }`}
      >
        {plan.name === "Free" ? "Start free forever" : "Start 14-day trial"}
      </Link>
    </div>
  );
}

export default function PricingTable() {
  const [annual, setAnnual] = useState(true);
  const [deployment, setDeployment] = useState<"cloud" | "office">("cloud");
  const plans = deployment === "cloud" ? CLOUD_PLANS : BOX_PLANS;

  return (
    <section id="plans" className="bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className={sectionLabel}>Pricing</span>
          <h2 className="mt-4 text-balance text-3xl font-extrabold tracking-tight text-brand-950 sm:text-5xl">
            Pay for the workspace, not for every seat
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Flat pricing per organisation. No hidden contact limits, no per-user
            tax when you grow.
          </p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
            {(["cloud", "office"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDeployment(option)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                  deployment === option
                    ? "bg-brand-500 text-white"
                    : "text-slate-500 hover:text-brand-600"
                }`}
              >
                {option === "cloud" ? "Online (cloud)" : "Office (on-premise)"}
              </button>
            ))}
          </div>
          {deployment === "cloud" && (
            <div className="inline-flex items-center gap-3 text-sm">
              <span className={annual ? "text-slate-500" : "font-bold text-brand-700"}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setAnnual((value) => !value)}
                aria-label="Toggle annual billing"
                className={`relative h-7 w-13 rounded-full transition ${
                  annual ? "bg-brand-500" : "bg-slate-300"
                }`}
                style={{ width: "3.25rem" }}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                    annual ? "left-7" : "left-1"
                  }`}
                />
              </button>
              <span className={annual ? "font-bold text-brand-700" : "text-slate-500"}>
                Annual <span className="text-mint-400">save 20%</span>
              </span>
            </div>
          )}
        </div>

        <div
          className={`mt-12 grid gap-5 ${
            deployment === "cloud"
              ? "sm:grid-cols-2 lg:grid-cols-5"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} annual={annual} />
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          All plans include unlimited contacts, mobile apps, 2-factor
          authentication and free migration assistance.
        </p>
      </div>
    </section>
  );
}
