import { Check, Coffee, Repeat2, ShoppingBag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";

const options = [
  {
    icon: ShoppingBag,
    eyebrow: "Compra avulsa",
    title: "Liberdade para comprar quando quiser",
    items: [
      "Você compra quando quiser",
      "Ideal para testar produtos",
      "Sem compromisso recorrente",
    ],
    action: "Ver cafés avulsos",
    href: "/produtos",
    tone: "light",
  },
  {
    icon: Repeat2,
    eyebrow: "Assinatura",
    title: "Praticidade para quem consome todo mês",
    items: [
      "Recebimento recorrente",
      "Mais praticidade na rotina",
      "Planos para diferentes consumos",
      "Possibilidade de benefícios exclusivos",
    ],
    action: "Ver planos",
    href: "#planos",
    tone: "dark",
  },
];

export function SubscriptionComparison() {
  return (
    <section className="bg-brand-cream/35 py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Você escolhe"
          title="Compra avulsa ou assinatura?"
          description="As duas opções continuam disponíveis. Escolha o formato que combina melhor com o seu momento."
          align="center"
        />
        <div className="mx-auto mt-11 grid max-w-5xl gap-5 lg:grid-cols-2">
          {options.map((option) => {
            const dark = option.tone === "dark";
            const Icon = option.icon;
            return (
              <article
                key={option.eyebrow}
                className={`rounded-4xl p-7 shadow-card sm:p-9 ${
                  dark
                    ? "bg-brand-brown text-white"
                    : "border border-brand-brown/10 bg-white text-brand-ink"
                }`}
              >
                <Icon
                  className={`h-9 w-9 ${
                    dark ? "text-brand-cream" : "text-brand-green"
                  }`}
                />
                <p
                  className={`mt-6 text-xs font-extrabold uppercase tracking-[0.18em] ${
                    dark ? "text-brand-cream" : "text-brand-green"
                  }`}
                >
                  {option.eyebrow}
                </p>
                <h3
                  className={`mt-3 text-3xl font-extrabold leading-tight ${
                    dark ? "text-white" : "text-brand-brown"
                  }`}
                >
                  {option.title}
                </h3>
                <ul className="mt-7 space-y-3">
                  {option.items.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          dark
                            ? "bg-white/10 text-brand-cream"
                            : "bg-brand-green/10 text-brand-green"
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </span>
                      <span className={dark ? "text-white/75" : "text-brand-ink/65"}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  href={option.href}
                  variant={dark ? "secondary" : "outline"}
                  className="mt-8"
                >
                  {option.action} <Coffee className="h-4 w-4" />
                </Button>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
