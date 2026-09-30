"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "How is NexagrowthCRM priced compared to other CRMs?",
    a: "You pay for the workspace, not per seat. A Professional workspace at ₦299,000/month covers 100 employees, so adding a rep costs nothing extra. Most teams switching from per-seat CRMs save 40-70% in the first year.",
  },
  {
    q: "Can I migrate from another CRM without losing data?",
    a: "Yes. CSV import is built in and maps standard fields automatically. For Salesforce, HubSpot, Pipedrive and Zoho we offer a free assisted migration with our onboarding engineers, including notes, attachments and activity history.",
  },
  {
    q: "Is there really a free plan?",
    a: "The Free plan includes unlimited users, unlimited contacts and deals, 5 GB storage, tasks, basic CRM and CRM webforms — free forever. Paid plans unlock automation, BI, telephony, sites and stores.",
  },
  {
    q: "Which channels can I connect to the contact centre?",
    a: "SIP telephony and 40+ providers, WhatsApp Business, Telegram, live chat widget, email, SMS, Instagram, Facebook Messenger and web forms. Every conversation is stored on the deal and contact timeline.",
  },
  {
    q: "Do you support automation without developers?",
    a: "The automation designer is fully no-code: pick a trigger, add conditions and actions, set delays and notifications. 400+ ready-made rules cover sales, marketing, finance and HR scenarios.",
  },
  {
    q: "Where is my data stored and how is it secured?",
    a: "Cloud workspaces run in EU or US regions with AES-256 encryption at rest, TLS 1.3 in transit, SSO/SAML, two-factor authentication and a full audit log. Enterprise customers can choose private cloud or on-premise deployment.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-12 max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white">
      {ITEMS.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            >
              <span className="text-[15px] font-bold text-brand-950">{item.q}</span>
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                  isOpen ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-600"
                }`}
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                  <path
                    d={isOpen ? "M5 10h10" : "M10 5v10M5 10h10"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {isOpen && (
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-slate-600">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
