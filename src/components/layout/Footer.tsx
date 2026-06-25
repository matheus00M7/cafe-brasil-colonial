"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import { useSiteContent } from "@/context/SiteContentContext";

const links = [
  ["Produtos", "/produtos"],
  ["Nossa História", "/nossa-historia"],
  ["Origem", "/origem"],
  ["Atacado", "/atacado"],
  ["Contato", "/contato"],
  ["Minha conta", "/minha-conta"],
  ["Privacidade", "/privacidade"],
];

export function Footer() {
  const content = useSiteContent();
  return (
    <footer className="relative overflow-hidden bg-brand-brown py-16 text-white">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[url('/brand/pattern-official.png')] bg-[length:420px] bg-repeat opacity-[0.055]"
        aria-hidden="true"
      />
      <Container className="relative grid gap-12 lg:grid-cols-[1.3fr_.7fr_.8fr]">
        <div>
          <div className="relative h-24 w-52">
            <Image
              src={content.brand.logoLight}
              alt={content.brand.name}
              fill
              className="object-contain object-left"
              sizes="208px"
            />
          </div>
          <p className="mt-5 max-w-md leading-7 text-white/70">
            {content.brand.description}
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href={createWhatsAppUrl(
                "Olá! Vim pelo site do Café Brasil Colonial e gostaria de mais informações.",
                content.brand.whatsapp,
              )}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 p-3 hover:bg-white/10"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
            {content.brand.instagram && (
              <a
                href={content.brand.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 p-3 hover:bg-white/10"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {content.brand.email && (
              <a
                href={`mailto:${content.brand.email}`}
                className="rounded-full border border-white/20 p-3 hover:bg-white/10"
                aria-label="E-mail"
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
        <div>
          <h2 className="font-extrabold text-brand-cream">Links rápidos</h2>
          <nav className="mt-5 flex flex-col gap-3 text-sm text-white/70">
            {links.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="font-extrabold text-brand-cream">Compra e entrega</h2>
          <p className="mt-5 text-sm leading-6 text-white/70">
            Pix, cartão de crédito, débito e boleto. Envio via Correios em até 1
            dia útil após a confirmação do pagamento.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Pix", "Crédito", "Débito", "Boleto"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/80"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-8 text-xs text-white/45">
            © {new Date().getFullYear()} {content.brand.name}. Todos os direitos
            reservados.
            {content.brand.cnpj ? ` CNPJ: ${content.brand.cnpj}.` : ""}
          </p>
        </div>
      </Container>
    </footer>
  );
}
