import { faq } from "@/data/faq";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

export function FAQSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
        <SectionTitle
          eyebrow="Dúvidas frequentes"
          title="Antes de escolher o seu café"
          description="Informações rápidas sobre produtos, entrega, pagamento e venda no atacado."
        />
        <FAQAccordion items={faq} />
      </Container>
    </section>
  );
}
