"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { CarouselSlide } from "@/types/site-content";

const tones = {
  green: "bg-brand-green",
  brown: "bg-brand-brown",
  olive: "bg-[#3f4f38]",
};

export function PromoCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(
      () => setActive((index) => (index + 1) % slides.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[active] || slides[0];

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div
          className={cn(
            "relative min-h-[310px] overflow-hidden rounded-4xl p-7 text-white shadow-soft transition-colors sm:p-10 lg:p-14",
            tones[slide.tone],
          )}
        >
          <div
            className="absolute inset-y-0 right-0 w-2/3 bg-[url('/brand/pattern-official.png')] bg-[length:440px] bg-repeat opacity-10"
            aria-hidden="true"
          />
          {slide.image && (
            <div className="absolute inset-y-0 right-0 hidden w-[44%] lg:block">
              <Image
                src={slide.image}
                alt=""
                fill
                className="object-cover opacity-75"
                sizes="44vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            </div>
          )}
          <div className="relative max-w-2xl lg:max-w-[54%]">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-cream">
              {slide.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {slide.title}
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-white/75">
              {slide.text}
            </p>
            <Button
              href={slide.href}
              variant="secondary"
              className="mt-7"
            >
              Saiba mais <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setActive(
                  (index) => (index - 1 + slides.length) % slides.length,
                )
              }
              className="rounded-full border border-white/20 bg-black/10 p-3 hover:bg-black/20"
              aria-label="Banner anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setActive((index) => (index + 1) % slides.length)
              }
              className="rounded-full border border-white/20 bg-black/10 p-3 hover:bg-black/20"
              aria-label="Próximo banner"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-7 left-7 flex gap-2 sm:left-auto sm:right-36">
            {slides.map((item, index) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setActive(index)}
                className={cn(
                  "h-2 rounded-full bg-white transition-all",
                  active === index ? "w-8" : "w-2 opacity-40",
                )}
                aria-label={`Abrir banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
