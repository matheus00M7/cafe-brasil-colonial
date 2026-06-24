import { Mail, MapPin, ShoppingBag, Users } from "lucide-react";
import { listCustomerAccounts } from "@/lib/customer-db";
import { listOrders } from "@/lib/orders-db";
import { listSubscriptions } from "@/lib/subscriptions-db";

export default async function AdminCustomersPage() {
  const [accounts, orders, subscriptions] = await Promise.all([
    listCustomerAccounts(),
    listOrders({ limit: 500 }),
    listSubscriptions(),
  ]);
  const orderCounts = new Map<string, number>();
  const subscriptionCounts = new Map<string, number>();
  orders.forEach((order) => {
    if (!order.customerAccountId) return;
    orderCounts.set(
      order.customerAccountId,
      (orderCounts.get(order.customerAccountId) || 0) + 1,
    );
  });
  subscriptions.forEach((subscription) => {
    if (!subscription.customerAccountId) return;
    subscriptionCounts.set(
      subscription.customerAccountId,
      (subscriptionCounts.get(subscription.customerAccountId) || 0) + 1,
    );
  });

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
        Relacionamento
      </p>
      <h1 className="mt-2 text-3xl font-extrabold text-brand-brown">
        Clientes cadastrados
      </h1>
      <p className="mt-3 text-sm text-brand-ink/55">
        Consulte contas, contatos e o volume de pedidos. Senhas e dados de
        cartão nunca ficam disponíveis no painel.
      </p>

      <div className="mt-7 rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-cream p-3 text-brand-brown">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-brand-ink/50">Total de contas</p>
            <p className="text-2xl font-extrabold text-brand-brown">
              {accounts.length}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {accounts.map((account) => (
          <article
            key={account.id}
            className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div>
                <h2 className="text-lg font-extrabold text-brand-brown">
                  {account.profile.fullName}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-brand-ink/55">
                  <Mail className="h-4 w-4" /> {account.email}
                </p>
                <p className="mt-2 text-sm text-brand-ink/55">
                  WhatsApp: {account.profile.whatsapp || "não informado"}
                </p>
              </div>
              <p className="text-xs text-brand-ink/40">
                Desde{" "}
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "medium",
                }).format(new Date(account.createdAt))}
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-brand-mist p-4">
                <ShoppingBag className="h-4 w-4 text-brand-green" />
                <p className="mt-2 text-xs text-brand-ink/50">Pedidos</p>
                <p className="font-extrabold text-brand-brown">
                  {orderCounts.get(account.id) || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-mist p-4">
                <Users className="h-4 w-4 text-brand-green" />
                <p className="mt-2 text-xs text-brand-ink/50">Assinaturas</p>
                <p className="font-extrabold text-brand-brown">
                  {subscriptionCounts.get(account.id) || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-brand-mist p-4">
                <MapPin className="h-4 w-4 text-brand-green" />
                <p className="mt-2 text-xs text-brand-ink/50">Cidade</p>
                <p className="truncate font-extrabold text-brand-brown">
                  {account.address.city || "—"}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!accounts.length && (
        <div className="mt-7 rounded-3xl border border-dashed border-brand-brown/20 bg-white p-10 text-center text-sm text-brand-ink/50">
          Nenhum cliente criou uma conta ainda.
        </div>
      )}
    </div>
  );
}
