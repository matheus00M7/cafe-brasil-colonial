"use client";

import { useState } from "react";
import { Check, CreditCard, Package, Repeat2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/formatCurrency";
import type {
  SubscriptionFrequency,
  SubscriptionGrind,
  SubscriptionPlan,
} from "@/types/subscription";

const frequencies: Array<{
  value: SubscriptionFrequency;
  title: string;
  text: string;
}> = [
  {
    value: "Mensal",
    title: "Mensal",
    text: "A principal escolha para manter o café da casa sempre em dia.",
  },
  {
    value: "Bimestral",
    title: "Bimestral",
    text: "Uma boa opção para quem consome menos café.",
  },
];

const grinds: Array<{
  value: SubscriptionGrind;
  title: string;
  text: string;
}> = [
  {
    value: "Em grãos",
    title: "Em grãos",
    text: "Para moer na hora e preservar o aroma.",
  },
  {
    value: "Moído para coador/filtro",
    title: "Moído",
    text: "Pronto para o preparo no coador ou filtro.",
  },
];

function PlanCard({
  plan,
  frequency,
  grind,
}: {
  plan: SubscriptionPlan;
  frequency: SubscriptionFrequency;
  grind: SubscriptionGrind;
}) {
  const [optionId, setOptionId] = useState(plan.options[0].id);
  const option =
    plan.options.find((item) => item.id === optionId) || plan.options[0];
  const checkoutUrl = `/assinatura/checkout?plan=${encodeURIComponent(
    plan.id,
  )}&option=${encodeURIComponent(option.id)}&frequency=${
    frequency === "Mensal" ? 1 : 2
  }&grind=${encodeURIComponent(grind)}`;

  return (
    <article
      className={`relative flex h-full flex-col rounded-4xl border p-6 sm:p-7 ${
        plan.featured
          ? "border-brand-green bg-brand-green text-white shadow-soft"
          : "border-brand-brown/10 bg-white text-brand-ink shadow-card"
      }`}
    >
      {plan.badge && (
        <Badge
          tone={plan.featured ? "cream" : "green"}
          className="w-fit"
        >
          {plan.badge}
        </Badge>
      )}
      <h3
        className={`mt-5 text-2xl font-extrabold ${
          plan.featured ? "text-white" : "text-brand-brown"
        }`}
      >
        {plan.name}
      </h3>
      <p
        className={`mt-3 min-h-20 text-sm leading-6 ${
          plan.featured ? "text-white/72" : "text-brand-ink/60"
        }`}
      >
        {plan.description}
      </p>
      <div
        className={`mt-5 rounded-2xl p-4 ${
          plan.featured ? "bg-white/10" : "bg-brand-mist"
        }`}
      >
        <p className="text-xs font-extrabold uppercase tracking-wider opacity-60">
          Café do plano
        </p>
        <p className="mt-1 font-extrabold">{plan.product}</p>
      </div>
      <label className="mt-5 text-sm font-extrabold">
        Café e quantidade
        <select
          value={optionId}
          onChange={(event) => setOptionId(event.target.value)}
          className={`mt-2 min-h-12 w-full rounded-2xl border px-4 font-bold outline-none ${
            plan.featured
              ? "border-white/20 bg-white text-brand-brown"
              : "border-brand-brown/15 bg-white text-brand-brown"
          }`}
        >
          {plan.options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <p
        className={`mt-4 text-xs leading-5 ${
          plan.featured ? "text-white/60" : "text-brand-ink/48"
        }`}
      >
        Ideal para: {plan.idealFor}.
      </p>
      <ul className="mt-6 space-y-3">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm">
            <Check
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                plan.featured ? "text-brand-cream" : "text-brand-green"
              }`}
            />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-7">
        <p
          className={`text-lg font-extrabold ${
            plan.featured ? "text-brand-cream" : "text-brand-brown"
          }`}
        >
          {formatCurrency(option.amount)}
          <span className="ml-1 text-sm font-bold opacity-65">
            / {frequency === "Mensal" ? "mês" : "2 meses"}
          </span>
        </p>
        <a
          href={checkoutUrl}
          className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-extrabold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
            plan.featured
              ? "bg-brand-cream text-brand-brown hover:bg-white focus-visible:outline-white"
              : "bg-brand-brown text-white hover:bg-[#4d1a0e] focus-visible:outline-brand-green"
          }`}
        >
          <CreditCard className="h-5 w-5" />
          Assinar agora
        </a>
      </div>
    </article>
  );
}

export function SubscriptionPlans({ plans }: { plans: SubscriptionPlan[] }) {
  const [frequency, setFrequency] =
    useState<SubscriptionFrequency>("Mensal");
  const [grind, setGrind] =
    useState<SubscriptionGrind>("Moído para coador/filtro");

  return (
    <section id="planos" className="scroll-mt-28 bg-brand-mist/70 py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Planos de assinatura"
          title="Escolha como o café entra na sua rotina"
          description="Defina a frequência, o formato e a quantidade. Depois, conclua o cadastro e o pagamento recorrente diretamente no site."
          align="center"
        />

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-2">
          <fieldset className="rounded-3xl border border-brand-brown/10 bg-white p-5 shadow-card">
            <legend className="sr-only">Frequência da assinatura</legend>
            <div className="flex items-center gap-3 text-brand-brown">
              <Repeat2 className="h-5 w-5" />
              <p className="font-extrabold">Frequência de entrega</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {frequencies.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    frequency === option.value
                      ? "border-brand-green bg-brand-green/5"
                      : "border-brand-brown/10"
                  }`}
                >
                  <span className="flex items-center gap-2 font-extrabold text-brand-brown">
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={frequency === option.value}
                      onChange={() => setFrequency(option.value)}
                      className="h-4 w-4 accent-brand-green"
                    />
                    {option.title}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-brand-ink/50">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-brand-brown/10 bg-white p-5 shadow-card">
            <legend className="sr-only">Formato do café</legend>
            <div className="flex items-center gap-3 text-brand-brown">
              <Package className="h-5 w-5" />
              <p className="font-extrabold">Formato do café</p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {grinds.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border p-4 transition ${
                    grind === option.value
                      ? "border-brand-green bg-brand-green/5"
                      : "border-brand-brown/10"
                  }`}
                >
                  <span className="flex items-center gap-2 font-extrabold text-brand-brown">
                    <input
                      type="radio"
                      name="grind"
                      value={option.value}
                      checked={grind === option.value}
                      onChange={() => setGrind(option.value)}
                      className="h-4 w-4 accent-brand-green"
                    />
                    {option.title}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-brand-ink/50">
                    {option.text}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-9 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              frequency={frequency}
              grind={grind}
            />
          ))}
        </div>

        <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-5 text-brand-ink/48">
          A cobrança é autorizada pelo Mercado Pago e se repete automaticamente
          na frequência escolhida. O cartão não é armazenado pela loja.
        </p>
      </Container>
    </section>
  );
}
