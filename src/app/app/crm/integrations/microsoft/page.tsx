import type { Metadata } from "next";
import ChannelWorkspace from "@/components/app/ChannelWorkspace";

export const metadata: Metadata = { title: "Microsoft 365 — NexagrowthCRM" };

export default function MicrosoftPage() {
  return <ChannelWorkspace app="microsoft" />;
}
