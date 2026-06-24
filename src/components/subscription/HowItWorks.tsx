import { CalendarCheck, Coffee, PackageCheck, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

const steps = [
  {
    icon: CalendarCheck,
    number: "01",
    title: "Escolha seu plano",
    text: "Selecione a quantidade e o perfil de café que combinam com a sua rotina.",
  },
  {
    icon: Coffee,
    number: "02",
    title: "Escolha o formato",
    text: "Prefira café em grãos ou moído para coador e filtro.",
  },
  {
    icon: PackageCheck,
    number: "03",
    title: "Receba em casa",
    text: "Seu café é preparado e enviado na frequência combinada.",
  },
  {
    icon: SlidersHorizontal,
    number: "04",
    title: "Pause ou altere",
    text: "Use a página de gerenciamento para pausar, reativar ou cancelar antes da próxima entrega.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Como funciona"
          title="Seu café em dia, sem complicação"
          description="Uma assinatura simples e flexível, feita para acompanhar o seu consumo."
          align="center"
        />
        <ol className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(({ icon: Icon, number, title, text }) => (
            <li
              key={number}
              className="relative rounded-3xl border border-brand-brown/10 bg-white p-6 shadow-card"
            >
              <span className="absolute right-5 top-4 text-4xl font-extrabold text-brand-cream/75">
                {number}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-extrabold text-brand-brown">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-brand-ink/62">{text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
