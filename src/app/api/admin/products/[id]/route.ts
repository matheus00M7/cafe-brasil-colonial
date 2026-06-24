import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateProductSettings } from "@/lib/orders-db";

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
      shortDescription?: string;
      longDescription?: string;
      badge?: string;
    };
    const product = await updateProductSettings(id, {
      price: Number(payload.price),
      active: Boolean(payload.active),
      stock:
        payload.stock === null || payload.stock === undefined
          ? null
          : Number(payload.stock),
      featured: Boolean(payload.featured),
      name: payload.name || "",
      image: payload.image || "",
      shortDescription: payload.shortDescription || "",
      longDescription: payload.longDescription || "",
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
