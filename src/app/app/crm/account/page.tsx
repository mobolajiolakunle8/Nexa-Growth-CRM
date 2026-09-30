import type { Metadata } from "next";
import AccountPanel from "@/components/app/AccountPanel";

export const metadata: Metadata = { title: "Account — NexagrowthCRM" };

export default function AccountPage() {
  return <AccountPanel />;
}
