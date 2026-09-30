import type { Metadata } from "next";
import DealsBoard from "@/components/app/DealsBoard";

export const metadata: Metadata = {
  title: "Pipeline — NexagrowthCRM",
};

export default function DealsPage() {
  return <DealsBoard />;
}
