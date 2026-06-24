import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Coffee,
  PackageCheck,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  getSubscriptionById,
  verifySubscriptionManagementToken,
} from "@/lib/subscriptions-db";

export const metadata: Metadata = {
  title: "Assinatura criada",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const { id, token } = await searchParams;
  if (!id || !token || !(await verifySubscriptionManagementToken(id, token))) {
    notFound();
  }
  const subscription = id ? await getSubscriptionById(id) : null;
  if (!subscription) notFound();

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-5xl">
        <div className="rounded-4xl border border-brand-green/20 bg-brand-green/5 p-7 text-center shadow-card sm:p-12">
          <CheckCircle2 className="mx-auto h-14 w-14 text-brand-green" />
          <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
            Assinatura {subscription.subscriptionNumber}
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-brand-brown sm:text-5xl">
            Sua assinatura foi criada
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-brand-ink/65">
            O Mercado Pago autorizou a cobrança recorrente. A primeira cobrança
            pode levar aproximadamente uma hora para aparecer como processada.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <Coffee className="h-7 w-7 text-brand-green" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-brand-ink/45">
              Plano
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-brown">
              {subscription.planName}
            </h2>
            <p className="mt-2 text-sm text-brand-ink/55">
              {subscription.coffee} · {subscription.quantity}
            </p>
          </article>
          <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <CalendarCheck className="h-7 w-7 text-brand-green" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-brand-ink/45">
              Cobrança
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-brown">
              {formatCurrency(subscription.amount)}
            </h2>
            <p className="mt-2 text-sm text-brand-ink/55">
              A cada{" "}
              {subscription.frequencyMonths === 1 ? "mês" : "dois meses"}
            </p>
          </article>
          <article className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card">
            <PackageCheck className="h-7 w-7 text-brand-green" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-brand-ink/45">
              Entrega
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-brand-brown">
              {subscription.address.city}/{subscription.address.state}
            </h2>
            <p className="mt-2 text-sm text-brand-ink/55">
              {subscription.grind}
            </p>
          </article>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            href={`/assinatura/gerenciar?id=${encodeURIComponent(
              subscription.id,
            )}&token=${encodeURIComponent(token)}`}
            variant="green"
            size="lg"
          >
            Gerenciar assinatura
          </Button>
          <Button href="/produtos" size="lg">
            Comprar café avulso
          </Button>
          <Button href="/" variant="outline" size="lg">
            Voltar para a loja
          </Button>
        </div>
      </Container>
    </section>
  );
}
