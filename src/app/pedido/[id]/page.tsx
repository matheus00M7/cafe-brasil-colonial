import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { OrderStatus } from "@/components/order/OrderStatus";
import { getOrderById, toPublicOrder } from "@/lib/orders-db";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Status do pedido",
  description: "Acompanhe o pagamento e o status do seu pedido.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();
  if (order.customerAccountId) {
    const session = await getCustomerSession();
    if (session?.account.id !== order.customerAccountId) notFound();
  }

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <OrderStatus initialOrder={toPublicOrder(order)} />
      </Container>
    </section>
  );
}
