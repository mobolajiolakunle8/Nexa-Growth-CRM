import type { Metadata } from "next";
import AuthGuard from "@/components/auth/AuthGuard";
import Shell from "@/components/app/Shell";

export const metadata: Metadata = {
  title: "Workspace — NexagrowthCRM",
};

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Shell>{children}</Shell>
    </AuthGuard>
  );
}
