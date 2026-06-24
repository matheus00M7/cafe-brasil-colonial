import Image from "next/image";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export function SubscriptionStory({ image }: { image: string }) {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative min-h-[440px] overflow-hidden rounded-4xl shadow-soft">
          <Image
            src={image}
            alt="Origem rural do Café Brasil Colonial"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute bottom-5 left-5 flex items-center gap-3 rounded-2xl bg-brand-paper/95 p-4 shadow-card">
            <MapPin className="h-5 w-5 text-brand-green" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
                Nossa origem
              </p>
              <p className="mt-1 text-sm font-extrabold text-brand-brown">
                Minas Gerais e Bahia
              </p>
            </div>
          </div>
        </div>
        <div>
          <Badge tone="green">Da origem até você</Badge>
          <h2 className="mt-5 text-3xl font-extrabold leading-tight text-brand-brown sm:text-5xl">
            Um clube para aproximar você do café de verdade
          </h2>
          <p className="mt-6 text-lg leading-8 text-brand-ink/65">
            O Clube de Assinatura Café Brasil Colonial aproxima quem aprecia
            café da origem real do produto. Da produção familiar em regiões
            cafeeiras de Minas Gerais e Bahia até a sua casa, a proposta é
            entregar não apenas café, mas uma experiência com história,
            tradição e qualidade.
          </p>
          <p className="mt-5 leading-7 text-brand-ink/55">
            Cada plano foi pensado para respeitar diferentes ritmos de consumo,
            sem perder a proximidade com quem prepara e seleciona o café.
          </p>
        </div>
      </Container>
    </section>
  );
}
