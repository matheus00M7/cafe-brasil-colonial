import { NextRequest, NextResponse } from "next/server";
import {
  createMercadoPagoPayment,
  paymentUpdateFromResponse,
} from "@/lib/mercado-pago";
import { getOrderById, updateOrderPayment } from "@/lib/orders-db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCustomerSession } from "@/lib/customer-auth";
import { assertSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  assertSameOrigin(request);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!checkRateLimit(`payment:${ip}`, 8)) {
    return NextResponse.json(
      { error: "Muitas tentativas de pagamento. Aguarde e tente novamente." },
      { status: 429 },
    );
  }

  try {
    const payload = (await request.json()) as {
      orderId?: string;
      paymentAttemptId?: string;
      formData?: Record<string, unknown>;
    };
    if (
      !payload.orderId ||
      !payload.formData ||
      !payload.paymentAttemptId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        payload.paymentAttemptId,
      )
    ) {
      return NextResponse.json(
        { error: "Dados de pagamento incompletos." },
        { status: 400 },
      );
    }

    const order = await getOrderById(payload.orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }
    if (order.customerAccountId) {
      const session = await getCustomerSession();
      if (session?.account.id !== order.customerAccountId) {
        return NextResponse.json(
          { error: "Pedido não encontrado." },
          { status: 404 },
        );
      }
    }
    if (order.status === "approved") {
      return NextResponse.json({
        orderId: order.id,
        paymentId: order.paymentId,
        status: order.paymentStatus,
        statusDetail: order.paymentStatusDetail,
        redirectUrl: `/pedido/${order.id}`,
      });
    }

    const payment = await createMercadoPagoPayment(
      order,
      payload.formData,
      payload.paymentAttemptId,
    );
    const update = paymentUpdateFromResponse(payment);
    await updateOrderPayment(order.id, update);

    return NextResponse.json({
      orderId: order.id,
      paymentId: String(payment.id),
      status: payment.status,
      statusDetail: payment.status_detail || "",
      redirectUrl: `/pedido/${order.id}`,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível processar o pagamento.";
    const configurationError = message.includes("Access Token");
    return NextResponse.json(
      { error: message },
      { status: configurationError ? 503 : 400 },
    );
  }
}
