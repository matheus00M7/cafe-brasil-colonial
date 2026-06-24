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

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  if (order.customerAccountId) {
    const session = await getCustomerSession();
    if (session?.account.id !== order.customerAccountId) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
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
