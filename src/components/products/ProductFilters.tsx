"use client";

import type { ProductCategory } from "@/types/product";
import { cn } from "@/lib/utils";

export type CategoryFilter = "Todos" | ProductCategory;
export type SortOption = "relevancia" | "menor" | "maior" | "intensidade";

const categories: CategoryFilter[] = [
  "Todos",
  "Tradicional",
  "Extraforte",
  "Gourmet",
  "Especial",
  "Kits",
];

export function ProductFilters({
  category,
  sort,
  onCategoryChange,
  onSortChange,
}: {
  category: CategoryFilter;
  sort: SortOption;
  onCategoryChange: (category: CategoryFilter) => void;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <div className="mb-9 flex flex-col gap-5 rounded-3xl border border-brand-brown/10 bg-white p-4 shadow-card lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-extrabold transition",
              category === item
                ? "bg-brand-brown text-white"
                : "bg-brand-mist text-brand-brown hover:bg-brand-cream",
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="flex shrink-0 items-center gap-3 text-sm font-bold text-brand-ink/70">
        Ordenar:
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
          className="min-h-11 rounded-full border border-brand-brown/15 bg-brand-paper px-4 outline-none focus:border-brand-green"
        >
          <option value="relevancia">Destaques</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
          <option value="intensidade">Mais intensos</option>
        </select>
      </label>
    </div>
  );
}
