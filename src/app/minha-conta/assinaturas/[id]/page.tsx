import { notFound, redirect } from "next/navigation";
import { CalendarCheck, Coffee, MapPin } from "lucide-react";
import { CustomerSubscriptionActions } from "@/components/subscription/CustomerSubscriptionActions";
import { getCustomerSession } from "@/lib/customer-auth";
import { formatCurrency } from "@/lib/formatCurrency";
import { getSubscriptionForCustomer } from "@/lib/subscriptions-db";

export default async function CustomerSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getCustomerSession();
  if (!session) redirect("/entrar");
  const { id } = await params;
  const subscription = await getSubscriptionForCustomer(
    id,
    session.account.id,
  );
  if (!subscription) notFound();

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <Coffee className="h-7 w-7 text-brand-green" />
          <h2 className="mt-4 font-extrabold text-brand-brown">
            {subscription.planName}
          </h2>
          <p className="mt-2 text-sm text-brand-ink/55">
            {subscription.coffee} · {subscription.quantity}
            <br />
            {subscription.grind}
          </p>
        </article>
        <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <CalendarCheck className="h-7 w-7 text-brand-green" />
          <h2 className="mt-4 font-extrabold text-brand-brown">
            {formatCurrency(subscription.amount)}
          </h2>
          <p className="mt-2 text-sm text-brand-ink/55">
            A cada {subscription.frequencyMonths === 1 ? "mês" : "dois meses"}
            <br />
            Status: {subscription.status}
          </p>
        </article>
        <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <MapPin className="h-7 w-7 text-brand-green" />
          <h2 className="mt-4 font-extrabold text-brand-brown">Entrega</h2>
          <p className="mt-2 text-sm leading-6 text-brand-ink/55">
            {subscription.address.street}, {subscription.address.number}
            <br />
            {subscription.address.city}/{subscription.address.state}
          </p>
        </article>
      </div>
      <section className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
        <h2 className="text-xl font-extrabold text-brand-brown">
          Gerenciar assinatura
        </h2>
        <div className="mt-5">
          <CustomerSubscriptionActions
            id={subscription.id}
            status={subscription.status}
          />
        </div>
      </section>
    </div>
  );
}
