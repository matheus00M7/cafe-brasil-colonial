import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const links = [
  ["Início", "/"],
  ["Produtos", "/produtos"],
  ["Nossa História", "/nossa-historia"],
  ["Origem", "/origem"],
  ["Atacado", "/atacado"],
  ["Contato", "/contato"],
];

export function MobileMenu({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer: { fullName: string } | null;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-brand-brown text-white lg:hidden">
      <div className="flex h-full flex-col px-6 py-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 p-3"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="my-auto flex flex-col gap-3">
          <Link
            href={customer ? "/minha-conta" : "/entrar"}
            onClick={onClose}
            className="border-b border-brand-cream/30 py-4 text-2xl font-extrabold text-brand-cream"
          >
            {customer ? "Minha conta" : "Entrar ou criar conta"}
          </Link>
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="border-b border-white/10 py-4 text-2xl font-extrabold"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Button href="/produtos" variant="secondary" size="lg" onClick={onClose}>
          Ver cafés
        </Button>
      </div>
    </div>
  );
}
