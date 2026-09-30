import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AuthProvider from "@/components/auth/AuthProvider";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NexagrowthCRM — Your whole company. One workspace.",
    template: "%s | NexagrowthCRM",
  },
  description:
    "NexagrowthCRM is the online workspace for CRM, sales automation, tasks, contact centre, websites and BI. Flat Naira pricing per organisation, free plan forever.",
  keywords: [
    "CRM Nigeria",
    "sales automation",
    "online CRM",
    "business workspace",
    "NexagrowthCRM",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "NexagrowthCRM",
    title: "NexagrowthCRM — Your whole company. One workspace.",
    description:
      "CRM, tasks, contact centre, sites, automation and BI in one online platform. Priced in Naira.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexagrowthCRM",
    description:
      "CRM, tasks, contact centre, sites, automation and BI in one workspace.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b2f56",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG">
      <body className="bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
