"use client";

import { useMemo, useState } from "react";
import { Coffee } from "lucide-react";
import type { Product } from "@/types/product";
import {
  ProductFilters,
  type CategoryFilter,
  type SortOption,
} from "./ProductFilters";
import { ProductGrid } from "./ProductGrid";

export function ProductCatalog({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<CategoryFilter>("Todos");
  const [sort, setSort] = useState<SortOption>("relevancia");

  const visible = useMemo(() => {
    const filtered =
      category === "Todos"
        ? [...products]
        : products.filter((product) => product.category === category);

    if (sort === "menor") filtered.sort((a, b) => a.price - b.price);
    if (sort === "maior") filtered.sort((a, b) => b.price - a.price);
    if (sort === "intensidade")
      filtered.sort((a, b) => b.intensity - a.intensity);
    return filtered;
  }, [products, category, sort]);

  return (
    <>
      <ProductFilters
        category={category}
        sort={sort}
        onCategoryChange={setCategory}
        onSortChange={setSort}
      />
      {visible.length ? (
        <ProductGrid products={visible} />
      ) : (
        <div className="rounded-4xl border border-dashed border-brand-brown/20 bg-white p-12 text-center">
          <Coffee className="mx-auto h-10 w-10 text-brand-brown/30" />
          <h2 className="mt-4 text-xl font-extrabold text-brand-brown">
            Nenhum café encontrado
          </h2>
          <p className="mt-2 text-brand-ink/60">
            Experimente selecionar outra categoria.
          </p>
        </div>
      )}
    </>
  );
}
