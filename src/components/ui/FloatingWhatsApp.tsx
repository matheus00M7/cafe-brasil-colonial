"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import { createWhatsAppUrl } from "@/lib/whatsapp";

const defaultMessage =
  "Olá! Vim pelo site da Café Brasil Colonial e gostaria de atendimento.";

export function FloatingWhatsApp() {
  const content = useSiteContent();
  const [open, setOpen] = useState(true);
  const whatsappUrl = createWhatsAppUrl(defaultMessage, content.brand.whatsapp);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="max-w-[280px] rounded-3xl border border-brand-green/20 bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-green">
                Atendimento
              </p>
              <h2 className="mt-1 text-base font-extrabold text-brand-brown">
                Precisa de ajuda?
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-brand-ink/35 hover:bg-brand-mist hover:text-brand-brown"
              aria-label="Fechar atendimento do WhatsApp"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm leading-5 text-brand-ink/60">
            Fale com a loja pelo WhatsApp para tirar dúvidas sobre produtos,
            entrega ou atendimento.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand-green px-5 text-sm font-extrabold text-white shadow-card hover:bg-[#005d3b]"
          >
            <MessageCircle className="h-5 w-5" />
            Chamar no WhatsApp
          </a>
        </div>
      )}

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setOpen(true)}
        className="group inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft ring-4 ring-white transition hover:scale-105 hover:bg-[#1ebe5d]"
        aria-label="Abrir atendimento pelo WhatsApp"
      >
        <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-[#25D366]/35 opacity-75 group-hover:hidden" />
        <MessageCircle className="relative h-8 w-8" />
      </a>
    </div>
  );
}
