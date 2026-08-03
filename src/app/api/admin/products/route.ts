import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { normalizeAdminProductPayload } from "@/lib/admin-product-security";
import { createProductSettings } from "@/lib/orders-db";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  assertSameOrigin(request);

  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const product = await createProductSettings(
      normalizeAdminProductPayload(payload, { activeDefault: true }),
    );

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Não foi possível criar.",
      },
      { status: 400 },
    );
  }
}
