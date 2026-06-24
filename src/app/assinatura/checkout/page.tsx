import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSubscriptionPlans } from "@/data/subscriptions";
import { getSiteContent } from "@/lib/orders-db";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SubscriptionCheckout } from "@/components/subscription/SubscriptionCheckout";
import type { SubscriptionGrind } from "@/types/subscription";
import { getCustomerSession } from "@/lib/customer-auth";

export const metadata: Metadata = {
  title: "Finalizar assinatura",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SubscriptionCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const content = await getSiteContent();
  const session = await getCustomerSession();
  const plans = getSubscriptionPlans(content.commerce.subscriptionPrices);
  const plan = plans.find((item) => item.id === params.plan);
  const option = plan?.options.find((item) => item.id === params.option);
  const frequencyMonths = Number(params.frequency);
  const grind = params.grind as SubscriptionGrind;
  if (
    !plan ||
    !option ||
    ![1, 2].includes(frequencyMonths) ||
    !["Em grãos", "Moído para coador/filtro"].includes(grind)
  ) {
    notFound();
  }

  return (
    <section className="py-12 sm:py-20">
      <Container>
        <Badge tone="green">Pagamento recorrente</Badge>
        <h1 className="mt-5 text-3xl font-extrabold text-brand-brown sm:text-5xl">
          Finalize sua assinatura
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-brand-ink/60">
          Preencha os dados de entrega e autorize a cobrança automática pelo
          Mercado Pago. Todo o processo acontece no próprio site.
        </p>
        <div className="mt-9">
          <SubscriptionCheckout
            plan={plan}
            option={option}
            frequencyMonths={frequencyMonths}
            grind={grind}
            initialCustomer={
              session
                ? {
                    fullName: session.account.profile.fullName,
                    email: session.account.email,
                    cpf: session.account.profile.cpf,
                    whatsapp: session.account.profile.whatsapp,
                  }
                : undefined
            }
            initialAddress={session?.account.address}
            signedIn={Boolean(session)}
          />
        </div>
      </Container>
    </section>
  );
}
