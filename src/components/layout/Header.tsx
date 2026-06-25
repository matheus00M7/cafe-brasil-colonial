"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, ShoppingBag, UserRound } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useSiteContent } from "@/context/SiteContentContext";
import { MobileMenu } from "./MobileMenu";

const links = [
  ["Início", "/"],
  ["Produtos", "/produtos"],
  ["Nossa História", "/nossa-historia"],
  ["Origem", "/origem"],
  ["Atacado", "/atacado"],
  ["Contato", "/contato"],
];

export function Header({
  customer,
}: {
  customer: { fullName: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const { itemCount, hydrated } = useCart();
  const content = useSiteContent();

  return (
    <>
      <div className="bg-brand-brown py-2 text-center text-xs font-bold tracking-wide text-brand-cream">
        {content.brand.announcement}
      </div>
      <header className="sticky top-0 z-50 border-b border-brand-brown/10 bg-brand-paper/95 backdrop-blur-xl">
        <Container className="flex min-h-20 items-center justify-between gap-5">
          <Link
            href="/"
            className="relative block h-14 w-40 shrink-0"
            aria-label={`${content.brand.name} - página inicial`}
          >
            <Image
              src={content.brand.logoDark}
              alt={content.brand.name}
              fill
              className="object-contain object-left"
              sizes="160px"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-5 lg:flex">
            {links.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-bold text-brand-ink/75 transition hover:text-brand-brown"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={customer ? "/minha-conta" : "/entrar"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-brown transition hover:border-brand-brown"
              aria-label={
                customer
                  ? `Abrir conta de ${customer.fullName}`
                  : "Entrar na conta"
              }
              title={customer ? "Minha conta" : "Entrar"}
            >
              <UserRound className="h-5 w-5" />
            </Link>
            <Link
              href="/carrinho"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-brown transition hover:border-brand-brown"
              aria-label={`Carrinho com ${hydrated ? itemCount : 0} itens`}
            >
              <ShoppingBag className="h-5 w-5" />
              {hydrated && itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-green px-1 text-[10px] font-extrabold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <Button href="/produtos" className="hidden xl:inline-flex">
              Comprar agora
            </Button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-brown/15 bg-white text-brand-brown lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </header>
      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
        customer={customer}
      />
    </>
  );
}
