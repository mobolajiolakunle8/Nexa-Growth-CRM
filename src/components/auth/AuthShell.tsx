import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand";

const POINTS = [
  "Unlimited contacts, deals and tasks on every plan",
  "WhatsApp, Slack, Stripe and Microsoft 365 built in",
  "A private workspace for every new signup",
];

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="grid-glow absolute inset-0 opacity-80" />
        <div className="relative">
          <Link href="/">
            <Logo invert />
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-balance text-4xl font-extrabold leading-tight tracking-tight">
            Your whole company.
            <br />
            <span className="gradient-text">One workspace.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm text-white/75">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-aqua-400/20 text-aqua-400">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
                    <path
                      d="M4 10.5l3.2 3.2L16 6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/40">
          Secured by Firebase Authentication · nexa-growth-crm
        </p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-brand-950 lg:mt-0">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export const authField =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-brand-950 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export const authLabel =
  "mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

export function GoogleButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-brand-950 transition hover:border-brand-300 hover:bg-slate-50 disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8Z"
        />
      </svg>
      {label}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        or
      </span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
