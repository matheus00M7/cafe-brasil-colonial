import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { getCustomerSession } from "@/lib/customer-auth";
import { listSubscriptionsByCustomerAccountId } from "@/lib/subscriptions-db";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/Button";

export default async function CustomerSubscriptionsPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/entrar");
  const subscriptions = await listSubscriptionsByCustomerAccountId(
    session.account.id,
  );
  return (
    <section className="rounded-4xl border border-brand-brown/10 bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-extrabold text-brand-brown">
            Minhas assinaturas
          </h2>
          <p className="mt-2 text-sm text-brand-ink/55">
            Acompanhe, pause, reative ou cancele as cobranças recorrentes.
          </p>
        </div>
        <Button href="/assinatura" size="sm">
          Criar assinatura
        </Button>
      </div>
      {subscriptions.length ? (
        <div className="mt-7 divide-y divide-brand-brown/10">
          {subscriptions.map((subscription) => (
            <Link
              key={subscription.id}
              href={`/minha-conta/assinaturas/${subscription.id}`}
              className="grid gap-3 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-3"
            >
              <div>
                <p className="font-extrabold text-brand-brown">
                  {subscription.planName}
                </p>
                <p className="mt-1 text-xs text-brand-ink/45">
                  {subscription.coffee} · {subscription.quantity}
                </p>
              </div>
              <span className="text-sm font-bold text-brand-ink/60">
                {subscription.status}
              </span>
              <span className="flex items-center gap-3 font-extrabold text-brand-brown">
                {formatCurrency(subscription.amount)}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-brand-brown/20 bg-brand-mist/40 p-10 text-center">
          <CalendarCheck className="mx-auto h-10 w-10 text-brand-brown/30" />
          <p className="mt-4 font-extrabold text-brand-brown">
            Nenhuma assinatura vinculada
          </p>
        </div>
      )}
    </section>
  );
}
