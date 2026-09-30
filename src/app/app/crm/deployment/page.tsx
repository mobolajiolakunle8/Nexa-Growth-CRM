import type { Metadata } from "next";
import DeploymentPanel from "@/components/app/DeploymentPanel";

export const metadata: Metadata = { title: "Deployment — NexagrowthCRM" };

export default function DeploymentPage() {
  return <DeploymentPanel />;
}
