import Image from "next/image";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import type { SiteContent } from "@/types/site-content";

export function B2BSection({
  content,
}: {
  content: SiteContent["sections"];
}) {
  return (
    <section className="bg-brand-brown py-16 text-white sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-cream">
            Atacado e parcerias
          </p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
            {content.b2bTitle}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
            {content.b2bDescription}
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              "Linha com diferentes perfis",
              "Origem brasileira",
              "Atendimento direto",
              "Negociação para revenda",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <Check className="h-5 w-5 text-brand-cream" />
                {item}
              </div>
            ))}
          </div>
          <WhatsAppButton
            message="Olá! Tenho interesse em comprar Café Brasil Colonial para meu negócio."
            className="mt-8"
          >
            Falar sobre atacado
          </WhatsAppButton>
        </div>
        <div className="relative min-h-[430px] overflow-hidden rounded-4xl border-4 border-white/10">
          <Image
            src={content.b2bImage}
            alt="Moedor, grãos e saco de café, imagem presente no manual da marca"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </Container>
    </section>
  );
}
