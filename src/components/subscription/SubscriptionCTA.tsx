import { ArrowUp, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function SubscriptionCTA() {
  return (
    <section className="relative overflow-hidden bg-brand-green py-16 text-white sm:py-24">
      <div
        className="absolute inset-y-0 right-0 w-2/3 bg-[url('/brand/pattern-official.png')] bg-[length:440px] bg-repeat opacity-[0.08]"
        aria-hidden="true"
      />
      <Container className="relative text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-cream">
          Seu próximo café começa aqui
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl">
          Pronto para receber seu café todos os meses?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/70">
          Escolha o plano ideal e leve a experiência do Café Brasil Colonial
          para a sua rotina.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="#planos" variant="secondary" size="lg">
            Escolher meu plano <ArrowUp className="h-5 w-5" />
          </Button>
          <Button
            href="/produtos"
            variant="outline"
            size="lg"
            className="border-white/30 bg-white/5 text-white hover:bg-white/10"
          >
            Comprar café avulso <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
