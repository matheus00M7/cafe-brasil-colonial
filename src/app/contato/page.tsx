import type { Metadata } from "next";
import { Instagram, Mail, MessageCircle, Store } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { Button } from "@/components/ui/Button";
import { getSiteContent } from "@/lib/orders-db";

export const metadata: Metadata = {
  title: "Contato",
  description:
    "Fale com o Café Brasil Colonial pelo WhatsApp, e-mail ou redes sociais.",
};

export default async function ContactPage() {
  const content = await getSiteContent();
  return (
    <>
      <section className="bg-brand-cream/45 py-16 sm:py-24">
        <Container>
          <Badge tone="green">Fale com a gente</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight text-brand-brown sm:text-6xl">
            Estamos prontos para ajudar no seu pedido
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-brand-ink/65">
            Tire dúvidas sobre produtos, entrega, formas de pagamento, atacado
            ou parcerias comerciais.
          </p>
        </Container>
      </section>
      <section className="py-16 sm:py-24">
        <Container className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-4xl bg-brand-brown p-7 text-white shadow-soft">
            <MessageCircle className="h-8 w-8 text-brand-cream" />
            <h2 className="mt-6 text-2xl font-extrabold">WhatsApp</h2>
            <p className="mt-3 leading-7 text-white/65">
              Canal direto para pedidos, dúvidas, frete e atendimento comercial.
            </p>
            <WhatsAppButton
              message="Olá! Vim pelo site do Café Brasil Colonial e gostaria de mais informações."
              className="mt-7"
            >
              Iniciar conversa
            </WhatsAppButton>
          </article>
          <article className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-card">
            <Instagram className="h-8 w-8 text-brand-green" />
            <h2 className="mt-6 text-2xl font-extrabold text-brand-brown">
              Instagram
            </h2>
            <p className="mt-3 leading-7 text-brand-ink/60">
              Espaço preparado para novidades, bastidores e conteúdos da marca.
            </p>
            {content.brand.instagram ? (
              <Button
                href={content.brand.instagram}
                external
                variant="outline"
                className="mt-7"
              >
                Abrir Instagram
              </Button>
            ) : (
              <p className="mt-7 rounded-2xl bg-brand-mist p-4 text-sm font-bold text-brand-brown">
                Cadastre o Instagram em Conteúdo da loja.
              </p>
            )}
          </article>
          <article className="rounded-4xl border border-brand-brown/10 bg-white p-7 shadow-card">
            <Mail className="h-8 w-8 text-brand-green" />
            <h2 className="mt-6 text-2xl font-extrabold text-brand-brown">
              E-mail comercial
            </h2>
            <p className="mt-3 leading-7 text-brand-ink/60">
              Para propostas, parcerias e assuntos institucionais.
            </p>
            {content.brand.email ? (
              <Button
                href={`mailto:${content.brand.email}`}
                external
                variant="outline"
                className="mt-7"
              >
                Enviar e-mail
              </Button>
            ) : (
              <p className="mt-7 rounded-2xl bg-brand-mist p-4 text-sm font-bold text-brand-brown">
                Cadastre o e-mail em Conteúdo da loja.
              </p>
            )}
          </article>
          <article className="rounded-4xl border border-brand-green/15 bg-brand-green/5 p-7 lg:col-span-3">
            <Store className="h-8 w-8 text-brand-green" />
            <h2 className="mt-5 text-2xl font-extrabold text-brand-brown">
              Atacado e parcerias
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-brand-ink/60">
              Restaurantes, hotéis, mercados, cafeterias e revendedores podem
              solicitar uma conversa comercial direta.
            </p>
            <Button href="/atacado" className="mt-6">
              Conhecer atendimento B2B
            </Button>
          </article>
        </Container>
      </section>
    </>
  );
}
