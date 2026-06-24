import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Clock3,
  PackageCheck,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { getDashboardStats, listOrders } from "@/lib/orders-db";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  fulfillmentStatusLabels,
  paymentStatusLabels,
  paymentStatusTone,
} from "@/lib/order-labels";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getDashboardStats(),
    listOrders({ limit: 6 }),
  ]);

  const cards = [
    {
      label: "Faturamento aprovado",
      value: formatCurrency(stats.approvedRevenue),
      detail: `${stats.approvedOrders} pagamentos aprovados`,
      icon: Banknote,
      tone: "bg-brand-green text-white",
    },
    {
      label: "Pedidos cadastrados",
      value: String(stats.totalOrders),
      detail: "Todos os pedidos registrados",
      icon: ShoppingBag,
      tone: "bg-brand-brown text-white",
    },
    {
      label: "Aguardando pagamento",
      value: String(stats.pendingOrders),
      detail: "Pix, boleto ou análise",
      icon: Clock3,
      tone: "bg-amber-100 text-amber-900",
    },
    {
      label: "Precisam de operação",
      value: String(stats.openFulfillment),
      detail: "Pagos e ainda não entregues",
      icon: PackageCheck,
      tone: "bg-brand-cream text-brand-brown",
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Visão geral
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            O que está acontecendo na loja
          </h1>
          <p className="mt-2 text-brand-ink/55">
            Resumo financeiro e operacional dos pedidos.
          </p>
        </div>
        <Link
          href="/admin/pedidos"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-brown/15 bg-white px-5 text-sm font-extrabold text-brand-brown shadow-card hover:border-brand-brown"
        >
          Ver todos os pedidos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, detail, icon: Icon, tone }) => (
          <article
            key={label}
            className="rounded-3xl border border-brand-brown/8 bg-white p-5 shadow-card"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm font-bold text-brand-ink/55">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-brown">
              {value}
            </p>
            <p className="mt-2 text-xs text-brand-ink/40">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-brand-brown/10 px-5 py-5 sm:px-7">
          <div>
            <h2 className="text-xl font-extrabold text-brand-brown">
              Pedidos recentes
            </h2>
            <p className="mt-1 text-sm text-brand-ink/45">
              Acompanhe os últimos movimentos da loja.
            </p>
          </div>
          <ReceiptText className="h-6 w-6 text-brand-green" />
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-brand-ink/45">
            Nenhum pedido registrado ainda.
          </div>
        ) : (
          <div className="divide-y divide-brand-brown/8">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="grid gap-3 px-5 py-5 transition hover:bg-brand-mist/50 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-7"
              >
                <div>
                  <p className="font-extrabold text-brand-brown">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-sm text-brand-ink/50">
                    {order.customer.fullName} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminStatusBadge
                    tone={paymentStatusTone[order.status]}
                  >
                    {paymentStatusLabels[order.status]}
                  </AdminStatusBadge>
                  <AdminStatusBadge tone="brown">
                    {fulfillmentStatusLabels[order.fulfillmentStatus]}
                  </AdminStatusBadge>
                </div>
                <p className="font-extrabold text-brand-brown">
                  {formatCurrency(order.total)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
