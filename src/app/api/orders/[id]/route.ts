import { NextResponse } from "next/server";
import {
  getOrderById,
  toPublicOrder,
  updateOrderPayment,
} from "@/lib/orders-db";
import {
  getMercadoPagoPayment,
  paymentUpdateFromResponse,
} from "@/lib/mercado-pago";
import { getCustomerSession } from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { requestIp } from "@/lib/request-security";

export const runtime = "nodejs";

const onlyDigits = (value: string | null) =>
  value ? value.replace(/\D/g, "") : "";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ip = requestIp(request);
  if (!checkRateLimit(`orders:get:${ip}:${id}`, 30, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Muitas consultas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  let order = await getOrderById(id);
  if (!order) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 },
    );
  }

  const session = await getCustomerSession();
  const sessionCanAccess =
    Boolean(order.customerAccountId) &&
    session?.account.id === order.customerAccountId;
  const headerCpf = onlyDigits(request.headers.get("x-order-cpf"));
  const cpfCanAccess =
    headerCpf.length === 11 && headerCpf === onlyDigits(order.customer.cpf);

  if (!sessionCanAccess && !cpfCanAccess) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 },
    );
  }

  const canRefreshPayment =
    order.paymentId &&
    !["approved", "rejected", "cancelled", "refunded", "charged_back"].includes(
      order.status,
    );

  if (canRefreshPayment) {
    try {
      const payment = await getMercadoPagoPayment(order.paymentId as string);
      await updateOrderPayment(order.id, paymentUpdateFromResponse(payment));
      order = (await getOrderById(id)) || order;
    } catch {
      // Se o Mercado Pago estiver temporariamente indisponível, devolvemos a
      // última informação salva sem derrubar a página do pedido.
    }
  }

  return NextResponse.json(toPublicOrder(order), {
    headers: { "Cache-Control": "no-store" },
  });
}
