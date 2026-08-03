"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const hasOptions = Boolean(product.productOptions?.length);

  const handleAdd = () => {
    if (hasOptions) return;
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl border border-brand-brown/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-brown/20 hover:shadow-soft">
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block aspect-[4/4.35] overflow-hidden bg-gradient-to-br from-brand-paper via-white to-brand-cream/45"
      >
        <div
          className="pointer-events-none absolute inset-x-5 bottom-0 top-5 rounded-[2rem] bg-white/55 shadow-inner"
          aria-hidden="true"
        />
        <Image
          src={product.image}
          alt={`Imagem de ${product.name}`}
          fill
          className="object-contain p-5 drop-shadow-[0_18px_24px_rgba(99,36,19,0.14)] transition duration-500 group-hover:scale-[1.04] sm:p-6"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/70 to-transparent"
          aria-hidden="true"
        />
        {product.badge && (
          <Badge className="absolute left-4 top-4" tone="cream">
            {product.badge}
          </Badge>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-green">
          {product.category} · {product.weight}
        </p>
        <h3 className="mt-3 min-h-[3.45rem] text-lg font-extrabold leading-tight text-brand-brown sm:text-xl">
          <Link href={`/produtos/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-3 min-h-[3rem] line-clamp-2 text-sm leading-6 text-brand-ink/65">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 rounded-3xl border border-brand-brown/10 bg-brand-paper p-4">
            <div>
              <span className="text-xs font-bold text-brand-ink/45">
                a partir de
              </span>
              <p className="text-2xl font-extrabold text-brand-brown">
                {formatCurrency(product.price)}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-brand-brown shadow-card">
              {hasOptions
                ? "Escolha opções"
                : `Intensidade ${product.intensity}/10`}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[.9fr_1.1fr]">
            <Button
              href={`/produtos/${product.slug}`}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Detalhes
            </Button>
            {hasOptions ? (
              <Button
                href={`/produtos/${product.slug}`}
                size="sm"
                className="w-full"
              >
                Escolher
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleAdd}
                className={
                  added ? "w-full bg-brand-green hover:bg-brand-green" : "w-full"
                }
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Adicionado
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" /> Adicionar
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
