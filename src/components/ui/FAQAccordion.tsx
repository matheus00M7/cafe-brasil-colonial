"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQAccordion({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-brand-brown/10 overflow-hidden rounded-3xl border border-brand-brown/10 bg-white shadow-card">
      {items.map((item, index) => {
        const active = open === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-7"
              onClick={() => setOpen(active ? null : index)}
              aria-expanded={active}
            >
              <span className="font-extrabold text-brand-brown">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-brand-green transition",
                  active && "rotate-180",
                )}
              />
            </button>
            {active && (
              <p className="px-5 pb-6 leading-7 text-brand-ink/70 sm:px-7">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
