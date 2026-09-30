import type { Metadata } from "next";
import ChannelWorkspace from "@/components/app/ChannelWorkspace";

export const metadata: Metadata = { title: "Shopify — NexagrowthCRM" };

export default function ShopifyPage() {
  return <ChannelWorkspace app="shopify" />;
}
