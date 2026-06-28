export type ProductCategory =
  | "Tradicional"
  | "Extraforte"
  | "Gourmet"
  | "Especial"
  | "Kits"
  | "Fardos"
  | "Canecas"
  | "Camisetas"
  | "Acessórios"
  | "Outros";

export type ProductKind =
  | "coffee"
  | "coffee_bundle"
  | "coffee_bale"
  | "mug"
  | "shirt"
  | "accessory"
  | "other";

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
  required?: boolean;
};

export type ProductSelectedOption = {
  optionId: string;
  name: string;
  value: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  productKind?: ProductKind;
  productOptions?: ProductOption[];
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
