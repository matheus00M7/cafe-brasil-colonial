import { Flame, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function RoastExplanationSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Entenda a torra"
          title="Intensidade ou equilíbrio: escolha o seu perfil"
          description="A torra muda a forma como o café revela corpo, aroma, doçura e presença na xícara."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-4xl bg-brand-brown p-7 text-white shadow-soft sm:p-10">
            <Flame className="h-9 w-9 text-brand-cream" />
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-cream">
              Torra mais escura
            </p>
            <h3 className="mt-3 text-3xl font-extrabold">
              Tradicional e Extraforte
            </h3>
            <p className="mt-4 leading-7 text-white/70">
              Sabor mais intenso, corpo presente e aroma clássico. Um perfil
              pensado para quem gosta do café forte do dia a dia.
            </p>
          </article>
          <article className="rounded-4xl border border-brand-green/15 bg-white p-7 shadow-card sm:p-10">
            <Sparkles className="h-9 w-9 text-brand-green" />
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
              Torra média
            </p>
            <h3 className="mt-3 text-3xl font-extrabold text-brand-brown">
              Gourmet e Especial
            </h3>
            <p className="mt-4 leading-7 text-brand-ink/65">
              Mais equilíbrio, aroma e doçura percebida. Um perfil para quem
              gosta de explorar nuances e métodos de preparo.
            </p>
          </article>
        </div>
      </Container>
    </section>
  );
}
