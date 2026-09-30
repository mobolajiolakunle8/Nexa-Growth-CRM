export function Logo({
  className = "",
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aqua-400 via-brand-500 to-violet-400 shadow-[0_10px_24px_-10px_rgba(31,147,239,0.9)]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path
            d="M5 19V6.2L12.4 13V5h3v12.8L8 10.9V19H5Z"
            fill="#fff"
          />
        </svg>
      </span>
      <span
        className={`text-[19px] font-extrabold leading-none tracking-tight ${
          invert ? "text-white" : "text-brand-950"
        }`}
      >
        Nexagrowth<span className="text-brand-500">CRM</span>
      </span>
    </span>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(31,147,239,0.9)] transition hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition hover:border-brand-300 hover:text-brand-600";

export const btnAqua =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-aqua-400 px-5 py-3 text-sm font-semibold text-brand-950 transition hover:bg-aqua-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-aqua-400/40";

export const sectionLabel =
  "inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600";
