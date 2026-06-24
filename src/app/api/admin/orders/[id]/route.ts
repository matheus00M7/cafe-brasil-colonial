import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { updateOrderAdmin } from "@/lib/orders-db";
import type { FulfillmentStatus } from "@/types/order";

const fulfillmentStatuses = new Set<FulfillmentStatus>([
  "new",
  "preparing",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const payload = (await request.json()) as {
    fulfillmentStatus?: FulfillmentStatus;
    trackingCode?: string;
    adminNotes?: string;
  };

  if (
    !payload.fulfillmentStatus ||
    !fulfillmentStatuses.has(payload.fulfillmentStatus)
  ) {
    return NextResponse.json(
      { error: "Situação operacional inválida." },
      { status: 400 },
    );
  }

  const order = await updateOrderAdmin(id, {
    fulfillmentStatus: payload.fulfillmentStatus,
    trackingCode: payload.trackingCode || "",
    adminNotes: payload.adminNotes || "",
  });
  if (!order) {
    return NextResponse.json(
      { error: "Pedido não encontrado." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, order });
}
