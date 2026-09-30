import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import ResetForm from "@/components/auth/ResetForm";

export const metadata: Metadata = {
  title: "Reset password — NexagrowthCRM",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email you a secure Firebase reset link."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-bold text-brand-600">
            Back to login
          </Link>
        </>
      }
    >
      <ResetForm />
    </AuthShell>
  );
}
