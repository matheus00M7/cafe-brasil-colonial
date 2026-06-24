import { NextResponse } from "next/server";
import {
  createCustomerSession,
  customerSessionCookieOptions,
  CUSTOMER_SESSION_COOKIE,
  resetCustomerPassword,
} from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!checkRateLimit(`account:reset:${requestIp(request)}`, 8, 30 * 60_000)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429 },
      );
    }
    const payload = (await request.json()) as {
      token?: string;
      password?: string;
    };
    if (!payload.token) throw new Error("Link de recuperação inválido.");
    const accountId = await resetCustomerPassword(
      payload.token,
      payload.password || "",
    );
    const session = await createCustomerSession(accountId);
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
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível redefinir a senha.",
      },
      { status: 400 },
    );
  }
}
