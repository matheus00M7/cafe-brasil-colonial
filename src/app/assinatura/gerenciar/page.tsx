import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, Coffee, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  getSubscriptionById,
  verifySubscriptionManagementToken,
} from "@/lib/subscriptions-db";
import { CustomerSubscriptionActions } from "@/components/subscription/CustomerSubscriptionActions";

export const metadata: Metadata = {
  title: "Gerenciar assinatura",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ManageSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;
  if (!id || !token || !(await verifySubscriptionManagementToken(id, token))) {
    notFound();
  }
  const subscription = await getSubscriptionById(id);
  if (!subscription) notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-5xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
          {subscription.subscriptionNumber}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-brand-brown sm:text-5xl">
          Gerenciar assinatura
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-brand-ink/60">
          Consulte os dados do plano e pause, reative ou cancele as próximas
          cobranças diretamente por esta página.
        </p>

        <div className="mt-9 grid gap-5 md:grid-cols-3">
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
              A cada{" "}
              {subscription.frequencyMonths === 1 ? "mês" : "dois meses"}
              <br />
              Status: {subscription.status}
            </p>
          </article>
          <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <MapPin className="h-7 w-7 text-brand-green" />
            <h2 className="mt-4 font-extrabold text-brand-brown">
              Endereço de entrega
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-ink/55">
              {subscription.address.street}, {subscription.address.number}
              <br />
              {subscription.address.city}/{subscription.address.state}
            </p>
          </article>
        </div>

        <div className="mt-7 rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
          <h2 className="text-xl font-extrabold text-brand-brown">
            Ações da assinatura
          </h2>
          <p className="mt-2 text-sm text-brand-ink/55">
            As mudanças são enviadas ao Mercado Pago e passam a valer nas
            próximas cobranças.
          </p>
          <div className="mt-5">
            <CustomerSubscriptionActions
              id={subscription.id}
              token={token}
              status={subscription.status}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
