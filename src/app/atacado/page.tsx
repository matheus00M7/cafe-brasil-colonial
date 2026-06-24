import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Café para o seu negócio",
  description:
    "Atendimento para restaurantes, hotéis, mercados, cafeterias e revendedores.",
};

const benefits = [
  "Fornecimento confiável",
  "Café com origem brasileira",
  "Linha tradicional, extraforte, gourmet e especial",
  "Atendimento direto pelo WhatsApp",
];

export default async function WholesalePage() {
  const content = await getSiteContent();
  return (
    <>
      <section className="bg-brand-brown py-16 text-white sm:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge tone="cream">Atacado e revenda</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-6xl">
              {content.sections.b2bTitle}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              {content.sections.b2bDescription}
            </p>
            <WhatsAppButton
              message="Olá! Tenho interesse em comprar Café Brasil Colonial para meu negócio."
              className="mt-8"
            >
              Falar sobre atacado
            </WhatsAppButton>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-4xl border-4 border-white/10">
            <Image
              src={content.sections.b2bImage}
              alt="Moedor e grãos de café"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Container>
      </section>
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-4 rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card"
              >
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-brand-green" />
                <div>
                  <h2 className="text-lg font-extrabold text-brand-brown">
                    {benefit}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-brand-ink/60">
                    Condições, volumes, disponibilidade e logística são
                    alinhados diretamente com a equipe comercial.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
