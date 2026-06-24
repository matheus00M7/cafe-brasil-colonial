"use client";

import { MessageCircle, Truck } from "lucide-react";
import type { DeliveryMethod } from "@/types/checkout";
import { cn } from "@/lib/utils";

const options = [
  {
    value: "correios",
    title: "Correios",
    text: "Frete e prazo confirmados pelo CEP.",
    icon: Truck,
  },
  {
    value: "retirada",
    title: "Retirada",
    text: "Sem frete. O local e horário serão informados após o pedido.",
    icon: MessageCircle,
  },
] as const;

export function DeliveryOptions({
  value,
  onChange,
}: {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
}) {
  return (
    <fieldset>
      <legend className="text-lg font-extrabold text-brand-brown">
        Entrega
      </legend>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map(({ value: option, title, text, icon: Icon }) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer gap-3 rounded-2xl border p-4 transition",
              value === option
                ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/10"
                : "border-brand-brown/10 bg-white hover:border-brand-brown/25",
            )}
          >
            <input
              type="radio"
              name="delivery"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
            <span>
              <span className="block font-bold text-brand-ink">{title}</span>
              <span className="mt-1 block text-xs leading-5 text-brand-ink/55">
                {text}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
