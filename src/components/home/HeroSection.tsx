import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/types/site-content";

const highlights = [
  "100% arábica",
  "Desde 1998",
  "Origem brasileira",
  "Envio para todo o Brasil",
];

export function HeroSection({
  content,
}: {
  content: SiteContent["hero"];
}) {
  return (
    <section className="relative overflow-hidden bg-brand-glow py-12 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/brand/pattern-seamless.png')] bg-[length:190px_148px] bg-left-top bg-repeat opacity-[0.045] [mask-image:linear-gradient(to_right,black_0%,black_40%,transparent_72%)]"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.02fr_.98fr]">
        <div className="reveal">
          <Badge tone="green">{content.eyebrow}</Badge>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-extrabold leading-[1.06] text-brand-brown sm:text-5xl lg:text-6xl xl:text-7xl">
            {content.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-brand-ink/70">
            {content.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={content.primaryHref} size="lg">
              {content.primaryLabel} <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              href={content.secondaryHref}
              variant="outline"
              size="lg"
            >
              {content.secondaryLabel}
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-sm font-bold text-brand-ink/75"
              >
                <CheckCircle2 className="h-5 w-5 text-brand-green" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-3 rotate-2 rounded-4xl bg-brand-cream/60" />
          <div className="relative aspect-[4/4.35] overflow-hidden rounded-4xl border-4 border-white bg-brand-cream shadow-soft">
            <Image
              src={content.image}
              alt="Composição oficial da marca com grãos de café, especiarias e o selo Café Brasil Colonial"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 48vw"
              priority
            />
          </div>
          <div className="absolute -bottom-5 left-5 rounded-2xl bg-white px-5 py-4 shadow-soft sm:left-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
              Origem
            </p>
            <p className="mt-1 font-extrabold text-brand-brown">
              {content.originLabel}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
