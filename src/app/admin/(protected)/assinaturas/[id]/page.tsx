import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, CreditCard, MapPin } from "lucide-react";
import Link from "next/link";
import { getSubscriptionById } from "@/lib/subscriptions-db";
import { formatCurrency } from "@/lib/formatCurrency";
import { SubscriptionAdminActions } from "@/components/admin/SubscriptionAdminActions";

export default async function AdminSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const subscription = await getSubscriptionById(id);
  if (!subscription) notFound();

  return (
    <div>
      <Link
        href="/admin/assinaturas"
        className="inline-flex items-center gap-2 text-sm font-extrabold text-brand-brown"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para assinaturas
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            {subscription.subscriptionNumber}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-brand-brown">
            {subscription.customer.fullName}
          </h1>
          <p className="mt-2 text-brand-ink/55">
            {subscription.planName} · {subscription.coffee}
          </p>
        </div>
        <span className="rounded-full bg-brand-cream px-4 py-2 text-sm font-extrabold text-brand-brown">
          {subscription.status}
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <CalendarCheck className="h-7 w-7 text-brand-green" />
          <h2 className="mt-4 text-lg font-extrabold text-brand-brown">
            Plano e cobrança
          </h2>
          <div className="mt-4 space-y-2 text-sm text-brand-ink/60">
            <p>{subscription.quantity} · {subscription.grind}</p>
            <p className="text-xl font-extrabold text-brand-brown">
              {formatCurrency(subscription.amount)}
            </p>
            <p>
              A cada {subscription.frequencyMonths} mês
              {subscription.frequencyMonths > 1 ? "es" : ""}
            </p>
          </div>
        </article>
        <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <CreditCard className="h-7 w-7 text-brand-green" />
          <h2 className="mt-4 text-lg font-extrabold text-brand-brown">
            Cliente
          </h2>
          <div className="mt-4 space-y-2 break-words text-sm text-brand-ink/60">
            <p>{subscription.customer.email}</p>
            <p>{subscription.customer.whatsapp}</p>
            <p>CPF: {subscription.customer.cpf}</p>
          </div>
        </article>
        <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <MapPin className="h-7 w-7 text-brand-green" />
          <h2 className="mt-4 text-lg font-extrabold text-brand-brown">
            Entrega
          </h2>
          <p className="mt-4 text-sm leading-6 text-brand-ink/60">
            {subscription.address.street}, {subscription.address.number}
            {subscription.address.complement
              ? ` · ${subscription.address.complement}`
              : ""}
            <br />
            {subscription.address.neighborhood}
            <br />
            {subscription.address.city}/{subscription.address.state} · CEP{" "}
            {subscription.address.cep}
          </p>
        </article>
      </div>

      <section className="mt-6 rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
        <h2 className="text-xl font-extrabold text-brand-brown">
          Gerenciar assinatura
        </h2>
        <p className="mt-2 text-sm text-brand-ink/55">
          As ações abaixo são enviadas diretamente ao Mercado Pago e afetam as
          próximas cobranças.
        </p>
        <div className="mt-5">
          <SubscriptionAdminActions
            id={subscription.id}
            status={subscription.status}
          />
        </div>
      </section>
    </div>
  );
}
