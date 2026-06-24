import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

export function SubscriptionFAQ({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <section className="bg-brand-mist/65 py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
        <SectionTitle
          eyebrow="Dúvidas frequentes"
          title="Antes de escolher seu plano"
          description="Respostas diretas sobre frequência, moagem, pagamento, entrega e flexibilidade da assinatura."
        />
        <FAQAccordion items={items} />
      </Container>
    </section>
  );
}
