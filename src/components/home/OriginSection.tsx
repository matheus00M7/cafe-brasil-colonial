import {
  Coffee,
  Leaf,
  MapPin,
  Mountain,
  PackageCheck,
  TimerReset,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

const facts = [
  [Coffee, "100% arábica", "Seleção voltada a aroma, corpo e qualidade."],
  [MapPin, "Origem brasileira", "Mata Verde/MG e Vale do Jequitinhonha."],
  [Mountain, "850–900m", "Fazendas em altitude favorável ao desenvolvimento dos grãos."],
  [Leaf, "Torra selecionada", "Perfis escuros e médios para diferentes preferências."],
  [PackageCheck, "Todo o Brasil", "Pedidos e pagamentos concluídos diretamente pelo site."],
  [TimerReset, "Desde 1998", "Tradição familiar construída com trabalho e cuidado."],
];

export function OriginSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Origem e qualidade"
          title="Altitude, clima e cuidado que aparecem na xícara"
          description="As regiões de Mata Verde, Vale do Jequitinhonha e Encruzilhada/Vila do Café reúnem tradição cafeeira, altitude entre 850 e 900 metros e condições que influenciam aroma, sabor e qualidade."
          align="center"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([Icon, title, text]) => (
            <article
              key={title as string}
              className="rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-brown">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-brand-brown">
                {title as string}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-ink/65">
                {text as string}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
