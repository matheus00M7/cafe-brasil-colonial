import Link from "next/link";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { listOrders } from "@/lib/orders-db";
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    pagamento?: string;
    operacao?: string;
  }>;
}) {
  const filters = await searchParams;
  const orders = await listOrders({
    query: filters.q,
    paymentStatus: filters.pagamento,
    fulfillmentStatus: filters.operacao,
    limit: 500,
  });

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Gestão de pedidos
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            Pedidos
          </h1>
          <p className="mt-2 text-brand-ink/55">
            Consulte pagamento, cliente, entrega e andamento operacional.
          </p>
        </div>
        <Link
          href="/api/admin/orders/export"
          download
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-brown/15 bg-white px-5 text-sm font-extrabold text-brand-brown shadow-card hover:border-brand-brown"
        >
          <Download className="h-4 w-4" />
          Exportar planilha
        </Link>
      </div>

      <form className="mt-7 grid gap-3 rounded-3xl border border-brand-brown/10 bg-white p-4 shadow-card lg:grid-cols-[1fr_220px_220px_auto]">
        <label className="relative">
          <span className="sr-only">Buscar pedido</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink/35" />
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Pedido, cliente, e-mail ou telefone"
            className="min-h-12 w-full rounded-2xl border border-brand-brown/12 bg-brand-paper pl-11 pr-4 outline-none focus:border-brand-green"
          />
        </label>
        <select
          name="pagamento"
          defaultValue={filters.pagamento || "all"}
          className="min-h-12 rounded-2xl border border-brand-brown/12 bg-brand-paper px-4 font-bold text-brand-ink/70 outline-none focus:border-brand-green"
        >
          <option value="all">Todos os pagamentos</option>
          {Object.entries(paymentStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="operacao"
          defaultValue={filters.operacao || "all"}
          className="min-h-12 rounded-2xl border border-brand-brown/12 bg-brand-paper px-4 font-bold text-brand-ink/70 outline-none focus:border-brand-green"
        >
          <option value="all">Todo andamento</option>
          {Object.entries(fulfillmentStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-brown px-5 font-extrabold text-white"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtrar
        </button>
      </form>

      <div className="mt-5 overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-brand-mist/70 text-xs uppercase tracking-wider text-brand-ink/45">
              <tr>
                <th className="px-5 py-4 font-extrabold">Pedido</th>
                <th className="px-5 py-4 font-extrabold">Cliente</th>
                <th className="px-5 py-4 font-extrabold">Pagamento</th>
                <th className="px-5 py-4 font-extrabold">Operação</th>
                <th className="px-5 py-4 font-extrabold">Total</th>
                <th className="px-5 py-4 font-extrabold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-brown/8">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-mist/30">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="font-extrabold text-brand-brown hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-xs text-brand-ink/40">
                      {order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      item(ns)
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-brand-ink">
                      {order.customer.fullName}
                    </p>
                    <p className="mt-1 text-xs text-brand-ink/45">
                      {order.address.city}/{order.address.state}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <AdminStatusBadge
                      tone={paymentStatusTone[order.status]}
                    >
                      {paymentStatusLabels[order.status]}
                    </AdminStatusBadge>
                  </td>
                  <td className="px-5 py-4">
                    <AdminStatusBadge tone="brown">
                      {fulfillmentStatusLabels[order.fulfillmentStatus]}
                    </AdminStatusBadge>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-brand-brown">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-4 text-sm text-brand-ink/50">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-12 text-center text-brand-ink/45">
            Nenhum pedido encontrado com esses filtros.
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-brand-ink/40">
        {orders.length} pedido(s) encontrado(s)
      </p>
    </div>
  );
}
