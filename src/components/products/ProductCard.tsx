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

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl border border-brand-brown/10 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block aspect-[5/5.5] overflow-hidden bg-brand-mist"
      >
        <Image
          src={product.image}
          alt={`Mockup ilustrativo de ${product.name}`}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
        <h3 className="mt-3 text-xl font-extrabold leading-tight text-brand-brown">
          <Link href={`/produtos/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-brand-ink/65">
          {product.shortDescription}
        </p>
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <span className="text-xs text-brand-ink/50">a partir de</span>
            <p className="text-2xl font-extrabold text-brand-brown">
              {formatCurrency(product.price)}
            </p>
          </div>
          <span className="rounded-full bg-brand-mist px-3 py-2 text-xs font-bold text-brand-brown">
            Intensidade {product.intensity}/10
          </span>
        </div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Button
            href={`/produtos/${product.slug}`}
            variant="outline"
            size="sm"
          >
            Ver detalhes
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleAdd}
            className={added ? "bg-brand-green hover:bg-brand-green" : ""}
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
        </div>
      </div>
    </article>
  );
}
