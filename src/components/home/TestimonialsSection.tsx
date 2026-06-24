import { Quote, Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function TestimonialsSection() {
  return (
    <section className="bg-brand-mist/70 py-16 sm:py-24">
      <Container>
        <SectionTitle
          eyebrow="Quem prova, conta"
          title="Café presente na rotina"
          description="Relatos ilustrativos de perfis de clientes que a linha foi pensada para atender."
          align="center"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-card"
            >
              <div className="flex items-center justify-between">
                <Quote className="h-8 w-8 text-brand-cream" />
                <div className="flex gap-1 text-brand-yellow">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-6 leading-7 text-brand-ink/70">
                “{testimonial.quote}”
              </p>
              <div className="mt-7 border-t border-brand-brown/10 pt-5">
                <p className="font-extrabold text-brand-brown">
                  {testimonial.name}
                </p>
                <p className="mt-1 text-xs text-brand-ink/50">
                  {testimonial.context}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
