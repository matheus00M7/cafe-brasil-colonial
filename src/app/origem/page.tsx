import type { Metadata } from "next";
import Image from "next/image";
import { Coffee, MapPin, Mountain, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Origem",
  description:
    "Cafés de Mata Verde/MG, Vale do Jequitinhonha e região de Encruzilhada/Vila do Café.",
};

export default async function OriginPage() {
  const content = await getSiteContent();
  return (
    <>
      <section className="relative overflow-hidden bg-brand-brown py-16 text-white sm:py-24">
        <div
          className="absolute inset-y-0 right-0 w-2/3 bg-[url('/brand/pattern-official.png')] bg-[length:440px] opacity-[0.08]"
          aria-hidden="true"
        />
        <Container className="relative">
          <Badge tone="cream">Minas Gerais</Badge>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Origem brasileira, altitude e cuidado no cultivo
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/70">
            Mata Verde, Vale do Jequitinhonha e Encruzilhada/Vila do Café formam
            o território de referência da marca, com fazendas entre 850 e 900
            metros de altitude.
          </p>
        </Container>
      </section>
      <section className="py-16 sm:py-24">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
          <div className="relative min-h-[500px] overflow-hidden rounded-4xl shadow-soft">
            <Image
              src={content.sections.originImage}
              alt="Café e origem rural"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-brand-brown sm:text-5xl">
              O lugar influencia o que chega à xícara
            </h2>
            <p className="mt-5 text-lg leading-8 text-brand-ink/65">
              Altitude, clima, maturação e cuidado no cultivo ajudam a construir
              aroma, corpo e equilíbrio. A torra completa esse trabalho,
              trazendo perfis mais intensos ou mais delicados.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [MapPin, "Mata Verde/MG"],
                [Mountain, "850–900m de altitude"],
                [Coffee, "Café 100% arábica"],
                [Sun, "Torra selecionada"],
              ].map(([Icon, text]) => (
                <div
                  key={text as string}
                  className="flex items-center gap-3 rounded-2xl bg-brand-mist p-4 font-bold text-brand-brown"
                >
                  <Icon className="h-5 w-5 text-brand-green" />
                  {text as string}
                </div>
              ))}
            </div>
            <Button href="/produtos" className="mt-8">
              Ver cafés
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
