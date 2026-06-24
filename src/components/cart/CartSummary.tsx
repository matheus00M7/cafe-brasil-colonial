import { PackageCheck, ShieldCheck } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/Button";

export function CartSummary({
  subtotal,
  disabled,
}: {
  subtotal: number;
  disabled?: boolean;
}) {
  return (
    <aside className="sticky top-32 rounded-4xl bg-brand-brown p-6 text-white shadow-soft sm:p-8">
      <h2 className="text-2xl font-extrabold">Resumo do carrinho</h2>
      <div className="mt-7 space-y-4 border-b border-white/15 pb-6">
        <div className="flex justify-between text-white/70">
          <span>Subtotal</span>
          <span className="font-bold text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Frete</span>
          <span className="font-bold text-brand-cream">A calcular</span>
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3">
        <span>Total estimado</span>
        <span className="text-3xl font-extrabold">
          {formatCurrency(subtotal)}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/50">
        A entrega e o valor final são calculados antes do pagamento.
      </p>
      <Button
        href={disabled ? undefined : "/checkout"}
        variant="secondary"
        size="lg"
        className="mt-7 w-full"
        disabled={disabled}
      >
        Finalizar pedido
      </Button>
      <div className="mt-6 space-y-3 text-xs text-white/65">
        <div className="flex gap-2">
          <PackageCheck className="h-4 w-4 shrink-0 text-brand-cream" />
          Postagem prevista em até 1 dia útil após o pagamento.
        </div>
        <div className="flex gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-cream" />
          Pagamento protegido e processado pelo Mercado Pago.
        </div>
      </div>
    </aside>
  );
}
