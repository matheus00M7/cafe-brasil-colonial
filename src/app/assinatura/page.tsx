import type { Metadata } from "next";
import { getSiteContent } from "@/lib/orders-db";
import {
  subscriptionFaq,
  getSubscriptionPlans,
} from "@/data/subscriptions";
import { SubscriptionHero } from "@/components/subscription/SubscriptionHero";
import { HowItWorks } from "@/components/subscription/HowItWorks";
import { SubscriptionPlans } from "@/components/subscription/SubscriptionPlans";
import { SubscriptionBenefits } from "@/components/subscription/SubscriptionBenefits";
import { SubscriptionComparison } from "@/components/subscription/SubscriptionComparison";
import { SubscriptionStory } from "@/components/subscription/SubscriptionStory";
import { SubscriptionFAQ } from "@/components/subscription/SubscriptionFAQ";
import { SubscriptionCTA } from "@/components/subscription/SubscriptionCTA";

export const metadata: Metadata = {
  title: "Café por Assinatura",
  description:
    "Receba Café Brasil Colonial todos os meses em casa. Escolha seu plano com cafés de origem, opções em grãos ou moído e entrega recorrente.",
};

export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const content = await getSiteContent();
  const plans = getSubscriptionPlans(content.commerce.subscriptionPrices);

  return (
    <>
      <SubscriptionHero image={content.hero.image} />
      <HowItWorks />
      <SubscriptionPlans plans={plans} />
      <SubscriptionBenefits />
      <SubscriptionComparison />
      <SubscriptionStory image={content.sections.originImage} />
      <SubscriptionFAQ items={subscriptionFaq} />
      <SubscriptionCTA />
    </>
  );
}
