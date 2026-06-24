import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/types/site-content";

export function StorySection({
  content,
}: {
  content: SiteContent["sections"];
}) {
  return (
    <section className="overflow-hidden bg-brand-cream/45 py-16 sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative min-h-[460px] overflow-hidden rounded-4xl shadow-soft">
          <Image
            src={content.storyImage}
            alt="Grãos de café dispostos sobre madeira, imagem presente no manual da marca"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute bottom-5 left-5 rounded-2xl bg-brand-paper/95 p-4 shadow-card">
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
              Tradição familiar
            </p>
            <p className="mt-1 font-extrabold text-brand-brown">Desde 1998</p>
          </div>
        </div>
        <div>
          <SectionTitle
            eyebrow="Nossa história"
            title={content.storyTitle}
            description={content.storyDescription}
          />
          <Button href="/nossa-historia" variant="outline" className="mt-8">
            Conheça a trajetória <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
