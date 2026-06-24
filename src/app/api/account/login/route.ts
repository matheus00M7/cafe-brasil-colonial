import { NextResponse } from "next/server";
import {
  authenticateCustomer,
  createCustomerSession,
  customerSessionCookieOptions,
  CUSTOMER_SESSION_COOKIE,
} from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const payload = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = (payload.email || "").trim().toLowerCase();
    const rateKey = `account:login:${requestIp(request)}:${email}`;
    if (!checkRateLimit(rateKey, 8, 15 * 60_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429 },
      );
    }
    const account = await authenticateCustomer(
      email,
      payload.password || "",
    );
    if (!account) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos." },
        { status: 401 },
      );
    }
    const session = await createCustomerSession(account.id);
    const response = NextResponse.json({
      ok: true,
      redirectUrl: "/minha-conta",
    });
    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      session.token,
      customerSessionCookieOptions,
    );
    return response;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível entrar. Tente novamente." },
      { status: 400 },
    );
  }
}
