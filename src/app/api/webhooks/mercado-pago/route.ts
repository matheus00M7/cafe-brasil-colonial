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
import { createAppLog } from "@/lib/app-logs";

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
      await createAppLog({
        level: "warn",
        area: "webhooks",
        event: "mercado_pago_webhook_invalid_signature",
        message: "Webhook do Mercado Pago recusado por assinatura inválida.",
        requestPath: request.nextUrl.pathname,
        details: {
          type: payload.type,
          action: payload.action,
          dataId,
        },
      });
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
    await createAppLog({
      level: "error",
      area: "webhooks",
      event: "mercado_pago_webhook_failed",
      message: "Falha ao processar webhook do Mercado Pago.",
      requestPath: request.nextUrl.pathname,
      details: {
        message:
          error instanceof Error
            ? error.message
            : "Falha desconhecida ao processar webhook.",
      },
    });
    return NextResponse.json(
      { error: "Falha ao processar a notificação." },
      { status: 500 },
    );
  }
}
