import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyCart() {
  return (
    <div className="rounded-4xl border border-dashed border-brand-brown/20 bg-white px-6 py-16 text-center shadow-card">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-cream text-brand-brown">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-2xl font-extrabold text-brand-brown">
        Seu carrinho está vazio
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-brand-ink/60">
        Conheça os cafés da linha Brasil Colonial e escolha o perfil que combina
        com a sua rotina.
      </p>
      <Button href="/produtos" className="mt-7">
        Ver cafés
      </Button>
    </div>
  );
}
