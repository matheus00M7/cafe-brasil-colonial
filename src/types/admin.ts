import type { Product, ProductKind, ProductOption } from "./product";

export type AdminProduct = Product & {
  active: boolean;
  stock: number | null;
  adminFeatured: boolean;
  updatedAt: string | null;
  custom?: boolean;
};

export type ProductSettingsUpdate = {
  price: number;
  active: boolean;
  stock: number | null;
  featured: boolean;
  name: string;
  image: string;
  category: Product["category"];
  productKind: ProductKind;
  productOptions: ProductOption[];
  type: string;
  weight: string;
  roast: string;
  grind: string;
  intensity: number;
  intensityLabel: string;
  shortDescription: string;
  longDescription: string;
  origin: string;
  preparation: string;
  sensoryNotes: string[];
  contents: string;
  badge: string;
};

export type ProductSettingsCreate = ProductSettingsUpdate;
