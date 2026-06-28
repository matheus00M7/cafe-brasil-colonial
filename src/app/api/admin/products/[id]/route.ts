import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import {
  deleteProductSettings,
  saveAdminProductSettings,
} from "@/lib/orders-db";
import type { ProductCategory, ProductKind, ProductOption } from "@/types/product";

const normalizeCategory = (value: unknown): ProductCategory =>
  value === "Extraforte" ||
  value === "Gourmet" ||
  value === "Especial" ||
  value === "Kits" ||
  value === "Fardos" ||
  value === "Canecas" ||
  value === "Camisetas" ||
  value === "Acessórios" ||
  value === "Outros"
    ? value
    : "Tradicional";

const normalizeProductKind = (value: unknown): ProductKind =>
  value === "coffee_bundle" ||
  value === "coffee_bale" ||
  value === "mug" ||
  value === "shirt" ||
  value === "accessory" ||
  value === "other"
    ? value
    : "coffee";

const normalizeProductOptions = (value: unknown): ProductOption[] =>
  Array.isArray(value) ? (value as ProductOption[]) : [];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = (await request.json()) as {
      price?: number;
      active?: boolean;
      stock?: number | null;
      featured?: boolean;
      name?: string;
      image?: string;
      category?: string;
      productKind?: ProductKind;
      productOptions?: ProductOption[];
      type?: string;
      weight?: string;
      roast?: string;
      grind?: string;
      intensity?: number;
      intensityLabel?: string;
      shortDescription?: string;
      longDescription?: string;
      origin?: string;
      preparation?: string;
      sensoryNotes?: string[];
      contents?: string;
      badge?: string;
    };
    const product = await saveAdminProductSettings(id, {
      price: Number(payload.price),
      active: Boolean(payload.active),
      stock:
        payload.stock === null || payload.stock === undefined
          ? null
          : Number(payload.stock),
      featured: Boolean(payload.featured),
      name: payload.name || "",
      image: payload.image || "",
      category: normalizeCategory(payload.category),
      productKind: normalizeProductKind(payload.productKind),
      productOptions: normalizeProductOptions(payload.productOptions),
      type: payload.type || "",
      weight: payload.weight || "",
      roast: payload.roast || "",
      grind: payload.grind || "",
      intensity: Number(payload.intensity),
      intensityLabel: payload.intensityLabel || "",
      shortDescription: payload.shortDescription || "",
      longDescription: payload.longDescription || "",
      origin: payload.origin || "",
      preparation: payload.preparation || "",
      sensoryNotes: Array.isArray(payload.sensoryNotes)
        ? payload.sensoryNotes
        : [],
      contents: payload.contents || "",
      badge: payload.badge || "",
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Não foi possível salvar.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "NÃ£o autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteProductSettings(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "NÃ£o foi possÃ­vel excluir.",
      },
      { status: 400 },
    );
  }
}
