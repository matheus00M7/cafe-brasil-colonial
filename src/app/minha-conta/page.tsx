import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageSearch, ShoppingBag } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";
import { listOrdersByCustomerAccountId } from "@/lib/orders-db";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  fulfillmentStatusLabels,
  paymentStatusLabels,
} from "@/lib/order-labels";
import { Button } from "@/components/ui/Button";

export default async function AccountPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/entrar");
  const orders = await listOrdersByCustomerAccountId(session.account.id);
  const paid = orders.filter((order) => order.status === "approved");
  const total = paid.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Pedidos", orders.length],
          ["Compras aprovadas", paid.length],
          ["Total em compras", formatCurrency(total)],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card"
          >
            <p className="text-sm text-brand-ink/50">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-brand-brown">
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-brown">
              Meus pedidos
            </h2>
            <p className="mt-2 text-sm text-brand-ink/55">
              Compras realizadas enquanto você estiver conectado aparecerão
              aqui.
            </p>
          </div>
          <Button href="/produtos" size="sm">
            <ShoppingBag className="h-4 w-4" /> Comprar novamente
          </Button>
        </div>
        {orders.length ? (
          <div className="mt-7 divide-y divide-brand-brown/10">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/minha-conta/pedidos/${order.id}`}
                className="grid gap-3 py-5 transition hover:bg-brand-mist/40 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:px-3"
              >
                <div>
                  <p className="font-extrabold text-brand-brown">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-brand-ink/45">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "medium",
                    }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-ink/65">
                  {paymentStatusLabels[order.status]}
                </span>
                <span className="text-sm font-bold text-brand-ink/65">
                  {fulfillmentStatusLabels[order.fulfillmentStatus]}
                </span>
                <span className="flex items-center justify-between gap-3 font-extrabold text-brand-brown">
                  {formatCurrency(order.total)}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-brand-brown/20 bg-brand-mist/40 p-10 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-brand-brown/30" />
            <p className="mt-4 font-extrabold text-brand-brown">
              Nenhum pedido vinculado ainda
            </p>
            <p className="mt-2 text-sm text-brand-ink/50">
              Faça sua próxima compra conectado à conta.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
