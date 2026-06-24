import Image from "next/image";
import type { CartItem } from "@/types/cart";
import { formatCurrency } from "@/lib/formatCurrency";

export function OrderSummary({
  items,
  subtotal,
  shipping = 0,
  total = subtotal,
}: {
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  total?: number;
}) {
  return (
    <aside className="sticky top-32 rounded-4xl bg-brand-brown p-6 text-white shadow-soft sm:p-8">
      <h2 className="text-2xl font-extrabold">Seu pedido</h2>
      <div className="mt-6 space-y-4">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-cream">
              <Image
                src={product.image}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-bold">{product.name}</p>
              <p className="mt-1 text-xs text-white/55">
                {quantity}x {formatCurrency(product.price)}
              </p>
            </div>
            <p className="text-sm font-extrabold">
              {formatCurrency(product.price * quantity)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 space-y-3 border-t border-white/15 pt-6 text-sm">
        <div className="flex justify-between text-white/65">
          <span>Subtotal</span>
          <span className="font-bold text-white">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-white/65">
          <span>Entrega</span>
          <span className="font-bold text-brand-cream">
            {shipping === 0 ? "Grátis" : formatCurrency(shipping)}
          </span>
        </div>
      </div>
      <div className="mt-6 flex items-end justify-between gap-3 border-t border-white/15 pt-6">
        <span>Total estimado</span>
        <span className="text-3xl font-extrabold">
          {formatCurrency(total)}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/50">
        O valor é recalculado pelo servidor antes da cobrança.
      </p>
    </aside>
  );
}
