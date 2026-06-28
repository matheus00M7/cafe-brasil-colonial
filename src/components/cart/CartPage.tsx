"use client";

import { getCartItemKey, useCart } from "@/context/CartContext";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";
import { EmptyCart } from "./EmptyCart";

export function CartPage() {
  const { items, subtotal, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="h-64 animate-pulse rounded-4xl bg-brand-mist" aria-hidden />
    );
  }

  if (!items.length) return <EmptyCart />;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_390px]">
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem key={getCartItemKey(item)} item={item} />
        ))}
      </div>
      <CartSummary subtotal={subtotal} />
    </div>
  );
}
