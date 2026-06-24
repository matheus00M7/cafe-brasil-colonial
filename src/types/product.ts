export type ProductCategory =
  | "Tradicional"
  | "Extraforte"
  | "Gourmet"
  | "Especial"
  | "Kits";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  type: string;
  weight: string;
  roast: string;
  grind: string;
  intensity: number;
  intensityLabel?: string;
  shortDescription: string;
  longDescription: string;
  origin: string;
  preparation: string;
  sensoryNotes: string[];
  price: number;
  image: string;
  contents?: string;
  badge?: string;
  featured?: boolean;
};
