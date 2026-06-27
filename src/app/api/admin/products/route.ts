import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { createProductSettings } from "@/lib/orders-db";

const normalizeCategory = (value: unknown) =>
  value === "Extraforte" ||
  value === "Gourmet" ||
  value === "Especial" ||
  value === "Kits"
    ? value
    : "Tradicional";

export async function POST(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "NÃ£o autorizado." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as {
      price?: number;
      active?: boolean;
      stock?: number | null;
      featured?: boolean;
      name?: string;
      image?: string;
      category?: string;
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

    const product = await createProductSettings({
      price: Number(payload.price),
      active: payload.active !== false,
      stock:
        payload.stock === null || payload.stock === undefined
          ? null
          : Number(payload.stock),
      featured: Boolean(payload.featured),
      name: payload.name || "",
      image: payload.image || "",
      category: normalizeCategory(payload.category),
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

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "NÃ£o foi possÃ­vel criar.",
      },
      { status: 400 },
    );
  }
}
