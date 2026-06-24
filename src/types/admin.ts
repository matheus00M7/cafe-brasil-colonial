import type { Product } from "./product";

export type AdminProduct = Product & {
  active: boolean;
  stock: number | null;
  adminFeatured: boolean;
  updatedAt: string | null;
};

export type ProductSettingsUpdate = {
  price: number;
  active: boolean;
  stock: number | null;
  featured: boolean;
  name: string;
  image: string;
  shortDescription: string;
  longDescription: string;
  badge: string;
};
