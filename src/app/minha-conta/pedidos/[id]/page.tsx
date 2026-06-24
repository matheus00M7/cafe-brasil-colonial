import { notFound, redirect } from "next/navigation";
import { OrderStatus } from "@/components/order/OrderStatus";
import { getCustomerSession } from "@/lib/customer-auth";
import { getOrderForCustomer, toPublicOrder } from "@/lib/orders-db";

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCustomerSession();
  if (!session) redirect("/entrar");
  const { id } = await params;
  const order = await getOrderForCustomer(id, session.account.id);
  if (!order) notFound();
  return <OrderStatus initialOrder={toPublicOrder(order)} />;
}
