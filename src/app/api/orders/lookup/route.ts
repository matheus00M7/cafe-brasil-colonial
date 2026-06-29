import { NextResponse } from "next/server";
import { listOrders, toPublicOrder } from "@/lib/orders-db";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export const runtime = "nodejs";

const onlyDigits = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D/g, "") : "";

export async function POST(request: Request) {
  assertSameOrigin(request);
  const ip = requestIp(request);
  if (!checkRateLimit(`orders:lookup:${ip}`, 12, 15 * 60_000)) {
    return NextResponse.json(
      { error: "Muitas consultas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  try {
    const payload = (await request.json()) as { cpf?: string };
    const cpf = onlyDigits(payload.cpf);
    if (cpf.length !== 11) {
      return NextResponse.json(
        { error: "Informe um CPF válido." },
        { status: 400 },
      );
    }

    const orders = await listOrders({ limit: 500 });
    const matches = orders
      .filter((order) => onlyDigits(order.customer.cpf) === cpf)
      .slice(0, 20)
      .map(toPublicOrder);

    return NextResponse.json(
      { orders: matches },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível consultar pedidos agora." },
      { status: 400 },
    );
  }
}
