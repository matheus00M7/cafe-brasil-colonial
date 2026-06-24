"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/types/cart";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <article className="grid gap-5 rounded-3xl border border-brand-brown/10 bg-white p-4 shadow-card sm:grid-cols-[140px_1fr] sm:p-5">
      <Link
        href={`/produtos/${item.product.slug}`}
        className="relative aspect-square overflow-hidden rounded-2xl bg-brand-mist"
      >
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="140px"
        />
      </Link>
      <div className="flex flex-col justify-between gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-brand-green">
              {item.product.category} · {item.product.weight}
            </p>
            <h2 className="mt-2 font-extrabold text-brand-brown sm:text-lg">
              <Link href={`/produtos/${item.product.slug}`}>
                {item.product.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-brand-ink/50">
              {formatCurrency(item.product.price)} por unidade
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.product.id)}
            className="rounded-full p-2 text-brand-ink/35 transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Remover ${item.product.name}`}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center rounded-full border border-brand-brown/15">
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.product.id, item.quantity - 1)
              }
              className="p-3 text-brand-brown"
              aria-label="Diminuir quantidade"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-9 text-center font-extrabold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.product.id, item.quantity + 1)
              }
              className="p-3 text-brand-brown"
              aria-label="Aumentar quantidade"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xl font-extrabold text-brand-brown">
            {formatCurrency(item.product.price * item.quantity)}
          </p>
        </div>
      </div>
    </article>
  );
}
