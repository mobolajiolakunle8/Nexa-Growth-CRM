import Link from "next/link";
import { Logo } from "@/components/brand";
import NewsletterForm from "@/components/site/NewsletterForm";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "NexagrowthCRM", href: "/app/crm" },
      { label: "Tasks & projects", href: "/app/crm/tasks" },
      { label: "Contacts & companies", href: "/app/crm/contacts" },
      { label: "Sales analytics", href: "/app/crm" },
      { label: "Integrations", href: "/integrations" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "For sales", href: "/#sales-intelligence" },
      { label: "For marketing", href: "/#marketing" },
      { label: "For support", href: "/#contact-center" },
      { label: "For agencies", href: "/#automation" },
    ],
  },
  {
    heading: "Pricing",
    links: [
      { label: "Basic", href: "/pricing" },
      { label: "Standard", href: "/pricing" },
      { label: "Professional", href: "/pricing" },
      { label: "Enterprise", href: "/pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/#metrics" },
      { label: "Customers", href: "/#testimonials" },
      { label: "Partners", href: "/integrations" },
      { label: "Start free", href: "/signup" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_2.7fr]">
          <div>
            <Logo invert />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              The online workspace your whole company runs on: CRM, projects,
              sites, automation and BI — from ₦18,000 per organisation, not per
              user.
            </p>
            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                Product digest
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="mb-4 text-sm font-bold">{column.heading}</p>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/65 transition hover:text-aqua-400"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NexagrowthCRM. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <span>Privacy policy</span>
            <span>Terms of service</span>
            <span>Security &amp; GDPR</span>
            <span>Status: all systems normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
