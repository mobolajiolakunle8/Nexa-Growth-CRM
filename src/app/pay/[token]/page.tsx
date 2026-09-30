import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CheckoutPay from "@/components/app/CheckoutPay";
import { getCheckoutSessionByToken } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Checkout — NexagrowthCRM",
};

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await getCheckoutSessionByToken(token);
  if (!record) notFound();
  return (
    <CheckoutPay
      token={token}
      product={record.product ?? null}
      status={record.session.status}
      amount={record.session.amount}
      email={record.session.customerEmail}
    />
  );
}
