import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create a workspace — NexagrowthCRM",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="A new empty workspace. No sample records, no shared account."
    >
      <SignupForm />
    </AuthShell>
  );
}
