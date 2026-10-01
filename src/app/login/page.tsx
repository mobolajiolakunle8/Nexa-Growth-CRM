import type { Metadata } from "next";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — NexagrowthCRM",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in"
      subtitle="Open the workspace you already created."
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
