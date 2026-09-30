import type { Metadata } from "next";
import ChannelWorkspace from "@/components/app/ChannelWorkspace";

export const metadata: Metadata = { title: "WhatsApp — NexagrowthCRM" };

export default function WhatsappPage() {
  return <ChannelWorkspace app="whatsapp" />;
}
