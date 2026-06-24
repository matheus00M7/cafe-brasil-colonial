import type { Metadata } from "next";
import Image from "next/image";
import { Coffee, HeartHandshake, Sprout } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Nossa história",
  description:
    "Conheça a tradição familiar e a ligação do Café Brasil Colonial com o campo desde 1998.",
};

export default async function StoryPage() {
  const content = await getSiteContent();
  return (
    <>
      <section className="bg-brand-cream/45 py-16 sm:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge tone="green">Desde 1998</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-brand-brown sm:text-6xl">
              Uma história de família, campo e café
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-ink/65">
              O Café Brasil Colonial nasceu de uma relação próxima com o campo e
              com o café presente na mesa brasileira. A marca une tradição,
              origem e cuidado para oferecer perfis que acompanham diferentes
              rotinas.
            </p>
          </div>
          <div className="relative min-h-[450px] overflow-hidden rounded-4xl shadow-soft">
            <Image
              src={content.sections.storyImage}
              alt="Grãos de café sobre madeira"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Container>
      </section>
      <section className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              [
                HeartHandshake,
                "Origem familiar",
                "Uma marca construída com proximidade, trabalho e respeito por quem produz e por quem prepara o café todos os dias.",
              ],
              [
                Sprout,
                "Relação com o campo",
                "Mata Verde/MG, Vale do Jequitinhonha e Encruzilhada/Vila do Café fazem parte da história de origem.",
              ],
              [
                Coffee,
                "Café 100% arábica",
                "Perfis de torra selecionados para equilibrar tradição, intensidade, aroma e qualidade real na xícara.",
              ],
            ].map(([Icon, title, text]) => (
              <article
                key={title as string}
                className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-card"
              >
                <Icon className="h-8 w-8 text-brand-green" />
                <h2 className="mt-6 text-2xl font-extrabold text-brand-brown">
                  {title as string}
                </h2>
                <p className="mt-3 leading-7 text-brand-ink/60">
                  {text as string}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-4xl bg-brand-brown p-8 text-white sm:p-12">
            <p className="max-w-4xl text-xl font-bold leading-9 sm:text-2xl">
              “Desde 1998, cultivando tradição e sabor com um compromisso
              simples: respeitar a origem e entregar um café honesto para a
              rotina brasileira.”
            </p>
            <Button href="/produtos" variant="secondary" className="mt-8">
              Conhecer os cafés
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
