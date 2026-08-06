"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import { createWhatsAppUrl } from "@/lib/whatsapp";

const defaultMessage =
  "Olá! Vim pelo site da Café Brasil Colonial e gostaria de atendimento.";

export function FloatingWhatsApp() {
  const content = useSiteContent();
  const [open, setOpen] = useState(false);
  if (!content.brand.whatsapp.replace(/\D/g, "")) return null;

  const whatsappUrl = createWhatsAppUrl(defaultMessage, content.brand.whatsapp);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="pointer-events-auto w-[min(calc(100vw-2rem),320px)] rounded-3xl border border-brand-green/20 bg-white p-4 shadow-soft">
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

      <div className="pointer-events-auto flex items-center gap-2">
        {!open && (
          <span className="hidden rounded-full border border-brand-green/15 bg-white px-4 py-2 text-xs font-extrabold text-brand-brown shadow-card sm:inline-flex">
            Atendimento
          </span>
        )}
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-soft ring-4 ring-white transition hover:scale-105 hover:bg-[#1ebe5d] sm:h-16 sm:w-16"
          aria-label={
            open ? "Fechar atendimento do WhatsApp" : "Abrir atendimento pelo WhatsApp"
          }
          aria-expanded={open}
        >
          {!open && (
            <span className="absolute inline-flex h-14 w-14 animate-ping rounded-full bg-[#25D366]/30 opacity-75 group-hover:hidden sm:h-16 sm:w-16" />
          )}
          {open ? (
            <X className="relative h-7 w-7" />
          ) : (
            <MessageCircle className="relative h-7 w-7 sm:h-8 sm:w-8" />
          )}
        </button>
      </div>
    </div>
  );
}
