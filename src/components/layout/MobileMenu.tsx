import Link from "next/link";
import { PackageCheck, ShoppingBag, UserRound, X } from "lucide-react";

const links = [
  ["Início", "/"],
  ["Produtos", "/produtos"],
  ["Origem", "/origem"],
  ["Atacado", "/atacado"],
  ["Contato", "/contato"],
  ["Nossa História", "/nossa-historia"],
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
      <div className="flex h-full flex-col overflow-y-auto px-5 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-cream">
              Menu
            </p>
            <p className="mt-1 text-sm text-white/60">
              Compre, acompanhe e fale com a loja.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 p-3"
            aria-label="Fechar menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mt-8 rounded-4xl bg-white/10 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-cream">
            Compra rápida
          </p>
          <h2 className="mt-2 text-3xl font-extrabold leading-tight">
            Escolha seu café sem complicação.
          </h2>
          <Link
            href="/produtos"
            onClick={onClose}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-cream px-6 text-sm font-extrabold text-brand-brown"
          >
            Ver produtos
          </Link>
        </div>

        <div className="mt-5 grid gap-3">
          <Link
            href={customer ? "/minha-conta" : "/entrar"}
            onClick={onClose}
            className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 font-extrabold text-brand-cream"
          >
            <UserRound className="h-5 w-5" />
            {customer ? "Minha conta" : "Entrar ou criar conta"}
          </Link>
          <Link
            href="/rastrear"
            onClick={onClose}
            className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 font-extrabold"
          >
            <PackageCheck className="h-5 w-5 text-brand-cream" />
            Rastrear pedido
          </Link>
          <Link
            href="/carrinho"
            onClick={onClose}
            className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 font-extrabold"
          >
            <ShoppingBag className="h-5 w-5 text-brand-cream" />
            Carrinho
          </Link>
        </div>

        <nav className="mt-7 flex flex-col gap-1 rounded-4xl bg-black/10 p-3">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="rounded-2xl px-4 py-3 text-lg font-extrabold text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
