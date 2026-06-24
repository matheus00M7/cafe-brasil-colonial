import Link from "next/link";
import { Repeat2 } from "lucide-react";
import { listSubscriptions } from "@/lib/subscriptions-db";
import { formatCurrency } from "@/lib/formatCurrency";

const statusLabel: Record<string, string> = {
  creating: "Criando",
  authorized: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
  canceled: "Cancelada",
  pending: "Pendente",
  error: "Erro",
};

export default async function AdminSubscriptionsPage() {
  const subscriptions = await listSubscriptions();
  const active = subscriptions.filter(
    (subscription) => subscription.status === "authorized",
  );
  const monthlyRevenue = active.reduce(
    (sum, subscription) =>
      sum + subscription.amount / subscription.frequencyMonths,
    0,
  );

  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
          <Repeat2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Cobrança recorrente
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown sm:text-4xl">
            Assinaturas
          </h1>
          <p className="mt-2 max-w-2xl text-brand-ink/55">
            Acompanhe assinantes, valores, frequência, endereço e situação da
            cobrança automática.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Assinaturas ativas", String(active.length)],
          ["Total cadastrado", String(subscriptions.length)],
          ["Receita mensal estimada", formatCurrency(monthlyRevenue)],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-3xl border border-brand-brown/10 bg-white p-5 shadow-card"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-ink/45">
              {label}
            </p>
            <p className="mt-3 text-2xl font-extrabold text-brand-brown">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card">
        {subscriptions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-brand-mist text-xs uppercase tracking-wider text-brand-brown">
                <tr>
                  <th className="px-5 py-4">Assinatura</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Plano</th>
                  <th className="px-5 py-4">Cobrança</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-brown/10">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/assinaturas/${subscription.id}`}
                        className="font-extrabold text-brand-brown hover:underline"
                      >
                        {subscription.subscriptionNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold">{subscription.customer.fullName}</p>
                      <p className="mt-1 text-xs text-brand-ink/45">
                        {subscription.customer.email}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold">{subscription.planName}</p>
                      <p className="mt-1 text-xs text-brand-ink/45">
                        {subscription.quantity} · {subscription.grind}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-bold text-brand-brown">
                      {formatCurrency(subscription.amount)}
                      <span className="block text-xs font-medium text-brand-ink/45">
                        a cada {subscription.frequencyMonths} mês
                        {subscription.frequencyMonths > 1 ? "es" : ""}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-brand-cream/55 px-3 py-1 text-xs font-extrabold text-brand-brown">
                        {statusLabel[subscription.status] ||
                          subscription.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <Repeat2 className="mx-auto h-10 w-10 text-brand-brown/30" />
            <p className="mt-4 font-extrabold text-brand-brown">
              Nenhuma assinatura criada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
