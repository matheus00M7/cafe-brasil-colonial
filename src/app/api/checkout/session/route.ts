import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  buildOrderItems,
  calculateOrderTotals,
  validateCheckoutData,
} from "@/lib/checkout";
import { createOrder } from "@/lib/orders-db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCustomerSession } from "@/lib/customer-auth";
import { updateCustomerDetails } from "@/lib/customer-db";
import { assertSameOrigin } from "@/lib/request-security";
import { createAppLog } from "@/lib/app-logs";

export const runtime = "nodejs";

const createOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomUUID().slice(0, 6).toUpperCase();
  return `CBC-${date}-${suffix}`;
};

export async function POST(request: NextRequest) {
  assertSameOrigin(request);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!checkRateLimit(`checkout:${ip}`)) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde um minuto e tente novamente." },
      { status: 429 },
    );
  }

  try {
    const payload = (await request.json()) as {
      customer?: unknown;
      items?: unknown;
    };
    const customer = validateCheckoutData(payload.customer);
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json(
        {
          error: "Entre na sua conta para finalizar a compra.",
          redirectUrl: "/entrar?redirect=/checkout",
        },
        { status: 401 },
      );
    }

    customer.email = session.account.email;
    const items = await buildOrderItems(payload.items);
    const totals = await calculateOrderTotals(items, customer.deliveryMethod);
    const id = randomUUID();
    const orderNumber = createOrderNumber();

    await createOrder({
      id,
      customerAccountId: session.account.id,
      orderNumber,
      customer: {
        fullName: customer.fullName,
        whatsapp: customer.whatsapp,
        email: customer.email,
        cpf: customer.cpf,
      },
      address: {
        cep: customer.cep,
        street: customer.street,
        number: customer.number,
        complement: customer.complement,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state,
      },
      deliveryMethod: customer.deliveryMethod,
      notes: customer.notes,
      items,
      ...totals,
    });

    await updateCustomerDetails(
      session.account.id,
      {
        fullName: customer.fullName,
        whatsapp: customer.whatsapp.replace(/\D/g, ""),
        cpf: customer.cpf.replace(/\D/g, ""),
      },
      {
        cep: customer.cep.replace(/\D/g, ""),
        street: customer.street,
        number: customer.number,
        complement: customer.complement,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state.toUpperCase(),
      },
    );

    return NextResponse.json({
      orderId: id,
      orderNumber,
      ...totals,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Não foi possível criar o pedido.";
    await createAppLog({
      level: "warn",
      area: "checkout",
      event: "checkout_session_failed",
      message: "Falha ao criar pedido no checkout.",
      requestPath: request.nextUrl.pathname,
      details: { message },
    });
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
