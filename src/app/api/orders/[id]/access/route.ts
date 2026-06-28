import { NextResponse } from "next/server";
import { getOrderById, toPublicOrder } from "@/lib/orders-db";

export const runtime = "nodejs";

const onlyDigits = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as { cpf?: string };
    const cpf = onlyDigits(payload.cpf);
    const order = await getOrderById(id);

    if (!order || cpf.length !== 11 || onlyDigits(order.customer.cpf) !== cpf) {
      return NextResponse.json(
        { error: "CPF não confere com este pedido." },
        { status: 404 },
      );
    }

    return NextResponse.json(toPublicOrder(order), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível validar o pedido." },
      { status: 400 },
    );
  }
}
