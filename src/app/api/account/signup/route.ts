import { NextResponse } from "next/server";
import {
  createCustomerSession,
  customerSessionCookieOptions,
  CUSTOMER_SESSION_COOKIE,
  registerCustomer,
} from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(`account:signup:${requestIp(request)}`, 5, 15 * 60_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429 },
      );
    }
    const payload = (await request.json()) as {
      email?: string;
      password?: string;
      fullName?: string;
      whatsapp?: string;
    };
    const account = await registerCustomer({
      email: payload.email || "",
      password: payload.password || "",
      fullName: payload.fullName || "",
      whatsapp: payload.whatsapp || "",
    });
    const session = await createCustomerSession(account.id);
    const response = NextResponse.json(
      { ok: true, redirectUrl: "/minha-conta" },
      { status: 201 },
    );
    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      session.token,
      customerSessionCookieOptions,
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Não foi possível criar a conta.",
      },
      { status: 400 },
    );
  }
}
