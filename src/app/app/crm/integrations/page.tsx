import type { Metadata } from "next";
import IntegrationsHub from "@/components/app/IntegrationsHub";

export const metadata: Metadata = {
  title: "Integrations — NexagrowthCRM",
};

export default function IntegrationsPage() {
  return <IntegrationsHub />;
}
