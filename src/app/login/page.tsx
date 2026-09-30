import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — NexagrowthCRM",
  description: "Sign in to your NexagrowthCRM workspace.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to open your CRM, pipeline and integrations."
      footer={
        <>
          New to NexagrowthCRM?{" "}
          <Link href="/signup" className="font-bold text-brand-600">
            Create a free workspace
          </Link>
        </>
      }
    >
      <Suspense
        fallback={<div className="h-72 animate-pulse rounded-2xl bg-white" />}
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
