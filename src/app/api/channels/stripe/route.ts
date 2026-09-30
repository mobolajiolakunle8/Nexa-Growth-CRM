import {
  cancelSubscription,
  createCheckoutSession,
  createInvoice,
  createProduct,
  createSubscription,
  fulfilCheckoutSession,
  getStripeOverview,
  importContactAsCustomer,
  markInvoiceFailed,
  markInvoicePaid,
  refundInvoice,
  simulateWebhook,
  toggleProduct,
  voidInvoice,
} from "@/lib/stripe";
import { emitEvent } from "@/lib/integrations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ data: await getStripeOverview() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load" },
      { status: 400 },
    );
  }
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalId(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    let message = "Saved";

    switch (action) {
      case "create_invoice":
        await createInvoice({
          dealId: optionalId(body.dealId),
          customerId: optionalId(body.customerId),
          amount: asNumber(body.amount),
          memo: typeof body.memo === "string" ? body.memo : undefined,
          dueDate: typeof body.dueDate === "string" ? body.dueDate : null,
          paymentMethod: typeof body.paymentMethod === "string" ? body.paymentMethod : "card",
        });
        message = "Invoice sent";
        break;
      case "mark_paid": {
        const paid = await markInvoicePaid(asNumber(body.id));
        if (paid.deal) await emitEvent("deal.stage_changed", paid.deal);
        message = "Invoice marked paid";
        break;
      }
      case "mark_failed":
        await markInvoiceFailed(asNumber(body.id));
        message = "Marked past due";
        break;
      case "refund":
        await refundInvoice(asNumber(body.id));
        message = "Refund issued";
        break;
      case "void":
        await voidInvoice(asNumber(body.id));
        message = "Invoice voided";
        break;
      case "create_product":
        await createProduct({
          name: typeof body.name === "string" ? body.name : undefined,
          interval: typeof body.interval === "string" ? body.interval : "month",
          price: asNumber(body.price),
        });
        message = "Product added";
        break;
      case "toggle_product":
        await toggleProduct(asNumber(body.id));
        message = "Product updated";
        break;
      case "create_subscription": {
        const result = await createSubscription({
          customerId: asNumber(body.customerId),
          productId: asNumber(body.productId),
          dealId: optionalId(body.dealId),
          quantity: asNumber(body.quantity) || 1,
        });
        if (result.subscription.dealId) {
          await emitEvent("deal.updated", { id: result.subscription.dealId });
        }
        message = "Subscription started";
        break;
      }
      case "cancel_subscription":
        await cancelSubscription(asNumber(body.id));
        message = "Subscription canceled";
        break;
      case "create_checkout":
        await createCheckoutSession({
          productId: asNumber(body.productId),
          dealId: optionalId(body.dealId),
          email: typeof body.email === "string" ? body.email : undefined,
        });
        message = "Checkout link ready";
        break;
      case "fulfil_checkout": {
        const result = await fulfilCheckoutSession({
          token: String(body.token ?? ""),
          email: typeof body.email === "string" ? body.email : undefined,
          name: typeof body.name === "string" ? body.name : undefined,
        });
        if (result && "invoice" in result && result.invoice.dealId) {
          await emitEvent("deal.stage_changed", { id: result.invoice.dealId, stage: "won" });
        }
        message = "Payment received";
        break;
      }
      case "import_contact":
        await importContactAsCustomer(asNumber(body.contactId));
        message = "Contact imported as customer";
        break;
      case "simulate": {
        const result = await simulateWebhook(String(body.kind ?? ""));
        if (result && "deal" in result && result.deal) {
          await emitEvent("deal.stage_changed", result.deal);
        }
        message = "Webhook replayed";
        break;
      }
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    return Response.json({ data: await getStripeOverview(), message });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 },
    );
  }
}
