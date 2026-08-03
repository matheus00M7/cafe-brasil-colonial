import "server-only";

import type {
  ProductCategory,
  ProductKind,
  ProductOption,
} from "@/types/product";

type AdminProductPayload = {
  price?: unknown;
  active?: unknown;
  stock?: unknown;
  featured?: unknown;
  name?: unknown;
  image?: unknown;
  category?: unknown;
  productKind?: unknown;
  productOptions?: unknown;
  type?: unknown;
  weight?: unknown;
  roast?: unknown;
  grind?: unknown;
  intensity?: unknown;
  intensityLabel?: unknown;
  shortDescription?: unknown;
  longDescription?: unknown;
  origin?: unknown;
  preparation?: unknown;
  sensoryNotes?: unknown;
  contents?: unknown;
  badge?: unknown;
};

const categories = new Set<ProductCategory>([
  "Tradicional",
  "Extraforte",
  "Gourmet",
  "Especial",
  "Kits",
  "Fardos",
  "Canecas",
  "Camisetas",
  "Acessórios",
  "Outros",
]);

const productKinds = new Set<ProductKind>([
  "coffee",
  "coffee_bundle",
  "coffee_bale",
  "mug",
  "shirt",
  "accessory",
  "other",
]);

export const cleanAdminText = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export const cleanAdminImagePath = (value: unknown) => {
  const path = cleanAdminText(value, 500);
  if (!path.startsWith("/")) return "";

  const safePrefixes = [
    "/products/",
    "/images/",
    "/brand/",
    "/uploads/",
    "/api/uploads/admin/",
  ];

  return safePrefixes.some((prefix) => path.startsWith(prefix)) ? path : "";
};

const normalizeCategory = (value: unknown): ProductCategory =>
  typeof value === "string" && categories.has(value as ProductCategory)
    ? (value as ProductCategory)
    : "Tradicional";

const normalizeProductKind = (value: unknown): ProductKind =>
  typeof value === "string" && productKinds.has(value as ProductKind)
    ? (value as ProductKind)
    : "coffee";

const normalizeNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
};

const normalizeProductOptions = (value: unknown): ProductOption[] => {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 8)
    .map((option, index) => {
      const input = option as Partial<ProductOption>;
      const values = Array.isArray(input.values)
        ? input.values
            .map((item) => cleanAdminText(item, 80))
            .filter(Boolean)
            .slice(0, 30)
        : [];

      return {
        id: cleanAdminText(input.id, 80) || `opcao-${index + 1}`,
        name: cleanAdminText(input.name, 80),
        values,
        required: input.required !== false,
      };
    })
    .filter((option) => option.name && option.values.length);
};

export const normalizeAdminProductPayload = (
  payload: AdminProductPayload,
  options: { activeDefault: boolean },
) => ({
  price: normalizeNumber(payload.price, 0.01, 0.01, 999_999),
  active:
    typeof payload.active === "boolean" ? payload.active : options.activeDefault,
  stock:
    payload.stock === null || payload.stock === undefined || payload.stock === ""
      ? null
      : Math.floor(normalizeNumber(payload.stock, 0, 0, 999_999)),
  featured: Boolean(payload.featured),
  name: cleanAdminText(payload.name, 160),
  image: cleanAdminImagePath(payload.image),
  category: normalizeCategory(payload.category),
  productKind: normalizeProductKind(payload.productKind),
  productOptions: normalizeProductOptions(payload.productOptions),
  type: cleanAdminText(payload.type, 80),
  weight: cleanAdminText(payload.weight, 80),
  roast: cleanAdminText(payload.roast, 80),
  grind: cleanAdminText(payload.grind, 80),
  intensity: Math.round(normalizeNumber(payload.intensity, 0, 0, 10)),
  intensityLabel: cleanAdminText(payload.intensityLabel, 80),
  shortDescription: cleanAdminText(payload.shortDescription, 320),
  longDescription: cleanAdminText(payload.longDescription, 2_000),
  origin: cleanAdminText(payload.origin, 180),
  preparation: cleanAdminText(payload.preparation, 500),
  sensoryNotes: Array.isArray(payload.sensoryNotes)
    ? payload.sensoryNotes
        .map((item) => cleanAdminText(item, 80))
        .filter(Boolean)
        .slice(0, 12)
    : [],
  contents: cleanAdminText(payload.contents, 500),
  badge: cleanAdminText(payload.badge, 60),
});
