import { NextRequest, NextResponse } from "next/server";
import {
  getMercadoPagoPayment,
  getPaymentOrderId,
  paymentUpdateFromResponse,
  validateWebhookSignature,
} from "@/lib/mercado-pago";
import {
  getOrderById,
  getOrderByPaymentId,
  updateOrderPayment,
} from "@/lib/orders-db";
import { syncSubscriptionWebhook } from "@/lib/subscriptions/service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };
    const url = new URL(request.url);
    const dataId =
      url.searchParams.get("data.id") || String(payload.data?.id || "");

    if (!dataId) return NextResponse.json({ received: true });

    const valid = validateWebhookSignature({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
    });
    if (!valid) {
      return NextResponse.json(
        { error: "Assinatura de webhook inválida." },
        { status: 401 },
      );
    }

    if (
      payload.type === "subscription_preapproval" ||
      payload.action?.startsWith("subscription_preapproval.")
    ) {
      await syncSubscriptionWebhook(dataId);
      return NextResponse.json({ received: true });
    }

    if (
      payload.type === "payment" ||
      payload.action?.startsWith("payment.")
    ) {
      const payment = await getMercadoPagoPayment(dataId);
      const orderId = getPaymentOrderId(payment);
      const order = orderId
        ? await getOrderById(orderId)
        : await getOrderByPaymentId(dataId);

      if (order) {
        await updateOrderPayment(order.id, paymentUpdateFromResponse(payment));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Falha ao processar webhook do Mercado Pago:", error);
    return NextResponse.json(
      { error: "Falha ao processar a notificação." },
      { status: 500 },
    );
  }
}
