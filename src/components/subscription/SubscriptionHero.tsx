import Image from "next/image";
import { ArrowDown, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function SubscriptionHero({ image }: { image: string }) {
  return (
    <section className="relative overflow-hidden bg-brand-glow py-14 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute -bottom-44 -left-20 h-[540px] w-[540px] bg-[url('/brand/pattern-official.png')] bg-contain bg-no-repeat opacity-[0.05]"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="reveal">
          <Badge tone="green">Clube de assinatura</Badge>
          <h1 className="mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] text-brand-brown sm:text-5xl lg:text-7xl">
            Receba Café Brasil Colonial todo mês na sua casa
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-ink/68">
            Escolha seu plano, receba cafés selecionados com frequência
            recorrente e nunca mais fique sem café fresco em casa.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#planos" size="lg">
              Ver planos <ArrowDown className="h-5 w-5" />
            </Button>
            <Button href="/produtos" variant="outline" size="lg">
              Comprar café avulso <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-6 max-w-xl text-sm leading-6 text-brand-ink/50">
            A compra avulsa continua disponível. A assinatura é uma opção
            complementar para quem deseja receber café com regularidade.
          </p>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 -rotate-2 rounded-4xl bg-brand-cream/70" />
          <div className="relative min-h-[460px] overflow-hidden rounded-4xl border-4 border-white shadow-soft sm:min-h-[560px]">
            <Image
              src={image}
              alt="Café Brasil Colonial, grãos e tradição da origem até a casa do assinante"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 46vw"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/35 to-transparent p-7 pt-28 text-white">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-cream">
                Café com história
              </p>
              <p className="mt-2 text-xl font-extrabold">
                Da produção familiar para a sua rotina
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
