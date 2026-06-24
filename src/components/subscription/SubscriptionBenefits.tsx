import {
  Coffee,
  HeartHandshake,
  House,
  Leaf,
  PauseCircle,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

const benefits = [
  [House, "Café sempre em casa", "Evite perceber que o café acabou justamente na hora de preparar."],
  [Leaf, "Origem com praticidade", "Receba café de origem sem precisar refazer o pedido a cada entrega."],
  [Sparkles, "Seleções especiais", "Tenha acesso a perfis selecionados e experiências além do café comum."],
  [PauseCircle, "Assinatura flexível", "Solicite pausa, alteração ou cancelamento antes da próxima preparação."],
  [Coffee, "Planos para cada rotina", "Escolha entre consumo diário, perfil gourmet ou experiência especial."],
  [HeartHandshake, "Perto de quem produz", "Uma relação mais próxima com uma marca familiar ligada à origem."],
];

export function SubscriptionBenefits() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Benefícios"
          title="Mais que uma entrega recorrente"
          description="Uma forma mais simples de manter café de qualidade na rotina e continuar conectado à origem."
          align="center"
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(([Icon, title, text]) => (
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
              <p className="mt-2 text-sm leading-6 text-brand-ink/60">
                {text as string}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
