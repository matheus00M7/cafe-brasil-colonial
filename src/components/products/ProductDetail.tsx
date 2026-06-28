"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Coffee,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import type { Product, ProductSelectedOption } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [optionError, setOptionError] = useState("");
  const { addItem } = useCart();

  const productOptions = product.productOptions || [];
  const missingRequiredOption = productOptions.some(
    (option) => option.required !== false && !selected[option.id],
  );

  const selectedOptions: ProductSelectedOption[] = productOptions
    .map((option) => {
      const value = selected[option.id];
      return value
        ? {
            optionId: option.id,
            name: option.name,
            value,
          }
        : null;
    })
    .filter(Boolean) as ProductSelectedOption[];

  const handleAdd = () => {
    if (missingRequiredOption) {
      setOptionError("Escolha as opções do produto antes de adicionar.");
      return;
    }
    addItem(product, quantity, selectedOptions);
    setOptionError("");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <Container className="py-10 sm:py-16">
      <Link
        href="/produtos"
        className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-brand-brown hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos produtos
      </Link>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="relative aspect-square overflow-hidden rounded-4xl bg-brand-mist shadow-card">
          <Image
            src={product.image}
            alt={`Imagem de ${product.name}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {product.badge && (
            <Badge className="absolute left-5 top-5">{product.badge}</Badge>
          )}
        </div>
        <div className="lg:pt-4">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-brand-green">
            {product.category} · {product.weight}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-brand-brown sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-lg leading-8 text-brand-ink/70">
            {product.longDescription}
          </p>
          <p className="mt-7 text-4xl font-extrabold text-brand-brown">
            {formatCurrency(product.price)}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              ["Torra / acabamento", product.roast],
              ["Tipo", product.type],
              ["Moagem / modelo", product.grind],
              ["Destaque", product.intensityLabel || `${product.intensity}/10`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-brand-brown/10 bg-white p-4"
              >
                <span className="text-xs font-extrabold uppercase tracking-wider text-brand-ink/45">
                  {label}
                </span>
                <p className="mt-1 font-bold text-brand-brown">{value}</p>
              </div>
            ))}
          </div>

          {productOptions.length > 0 && (
            <div className="mt-6 space-y-4 rounded-3xl border border-brand-green/20 bg-brand-green/5 p-5">
              <h2 className="text-lg font-extrabold text-brand-brown">
                Escolha as opções
              </h2>
              {productOptions.map((option) => (
                <div key={option.id}>
                  <p className="text-sm font-extrabold text-brand-ink">
                    {option.name}
                    {option.required !== false && " *"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSelected((current) => ({
                            ...current,
                            [option.id]: value,
                          }))
                        }
                        className={`rounded-full border px-4 py-2 text-sm font-extrabold transition ${
                          selected[option.id] === value
                            ? "border-brand-green bg-brand-green text-white"
                            : "border-brand-brown/15 bg-white text-brand-brown hover:border-brand-green"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {optionError && (
                <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
                  {optionError}
                </p>
              )}
            </div>
          )}

          {product.contents && (
            <div className="mt-4 rounded-2xl bg-brand-cream/45 p-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-brown">
                O produto contém
              </span>
              <p className="mt-1 font-bold text-brand-brown">
                {product.contents}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex min-h-14 items-center justify-between rounded-full border border-brand-brown/15 bg-white px-2">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="rounded-full p-3 text-brand-brown hover:bg-brand-mist"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center font-extrabold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="rounded-full p-3 text-brand-brown hover:bg-brand-mist"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={handleAdd}
              className={added ? "flex-1 bg-brand-green" : "flex-1"}
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" /> Adicionado ao carrinho
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Adicionar ao carrinho
                </>
              )}
            </Button>
          </div>

          <div className="mt-9 space-y-5 border-t border-brand-brown/10 pt-8">
            <div className="flex gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-brand-green" />
              <div>
                <h2 className="font-extrabold text-brand-brown">Origem</h2>
                <p className="mt-1 text-sm leading-6 text-brand-ink/65">
                  {product.origin}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Coffee className="mt-1 h-5 w-5 shrink-0 text-brand-green" />
              <div>
                <h2 className="font-extrabold text-brand-brown">
                  Preparo ou uso indicado
                </h2>
                <p className="mt-1 text-sm leading-6 text-brand-ink/65">
                  {product.preparation}
                </p>
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-brand-brown">
                Características
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sensoryNotes.map((note) => (
                  <span
                    key={note}
                    className="rounded-full bg-brand-mist px-3 py-2 text-xs font-bold text-brand-brown"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
