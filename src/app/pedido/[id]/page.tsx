import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { OrderStatus } from "@/components/order/OrderStatus";
import { OrderCpfAccess } from "@/components/order/OrderCpfAccess";
import { getOrderById, toPublicOrder, updateOrderPayment } from "@/lib/orders-db";
import { getCustomerSession } from "@/lib/customer-auth";
import {
  getMercadoPagoPayment,
  getPaymentOrderId,
  paymentUpdateFromResponse,
} from "@/lib/mercado-pago";

export const metadata: Metadata = {
  title: "Status do pedido",
  description: "Acompanhe o pagamento e o status do seu pedido.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const paymentIdParam =
    firstQueryValue(query.payment_id) ||
    firstQueryValue(query.collection_id) ||
    firstQueryValue(query["data.id"]);
  let order = await getOrderById(id);
  if (!order) notFound();
  if (
    paymentIdParam &&
    !["approved", "rejected", "cancelled", "refunded", "charged_back"].includes(
      order.status,
    )
  ) {
    try {
      const payment = await getMercadoPagoPayment(paymentIdParam);
      if (getPaymentOrderId(payment) === order.id) {
        await updateOrderPayment(order.id, paymentUpdateFromResponse(payment));
        order = (await getOrderById(id)) || order;
      }
    } catch {
      // O webhook e a consulta automática da página continuam tentando atualizar.
    }
  }
  const session = await getCustomerSession();
  const canAccessBySession =
    Boolean(order.customerAccountId) &&
    session?.account.id === order.customerAccountId;

  return (
    <section className="py-12 sm:py-20">
      <Container>
        {canAccessBySession ? (
          <OrderStatus initialOrder={toPublicOrder(order)} />
        ) : (
          <OrderCpfAccess orderId={order.id} />
        )}
      </Container>
    </section>
  );
}

const firstQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;
