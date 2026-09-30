import type { Metadata } from "next";
import StripeWorkspace from "@/components/app/StripeWorkspace";

export const metadata: Metadata = { title: "Stripe — NexagrowthCRM" };

export default function StripePage() {
  return <StripeWorkspace />;
}
