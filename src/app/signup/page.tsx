import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Start free — NexagrowthCRM",
  description:
    "Create your NexagrowthCRM workspace in under two minutes. 14-day trial of every feature, free plan forever.",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Start your free trial"
      subtitle="Create an account and your pipeline loads with sample data instantly."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-brand-600">
            Log in
          </Link>
        </>
      }
    >
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}
      >
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
