import type { Metadata } from "next";
import ChannelWorkspace from "@/components/app/ChannelWorkspace";

export const metadata: Metadata = { title: "Slack — NexagrowthCRM" };

export default function SlackPage() {
  return <ChannelWorkspace app="slack" />;
}
