import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { normalizeAdminProductPayload } from "@/lib/admin-product-security";
import {
  deleteProductSettings,
  saveAdminProductSettings,
} from "@/lib/orders-db";
import { assertSameOrigin } from "@/lib/request-security";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  assertSameOrigin(request);

  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = await request.json();
    const product = await saveAdminProductSettings(
      id,
      normalizeAdminProductPayload(payload, { activeDefault: false }),
    );
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
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  assertSameOrigin(request);

  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteProductSettings(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Não foi possível excluir.",
      },
      { status: 400 },
    );
  }
}
