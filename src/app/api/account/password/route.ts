import { NextResponse } from "next/server";
import {
  changeCustomerPassword,
  createCustomerSession,
  customerSessionCookieOptions,
  CUSTOMER_SESSION_COOKIE,
  getCustomerSession,
} from "@/lib/customer-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { assertSameOrigin, requestIp } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (
      !checkRateLimit(
        `account:password:${requestIp(request)}`,
        5,
        30 * 60_000,
      )
    ) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429 },
      );
    }
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Faça login novamente." }, { status: 401 });
    }
    const payload = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    await changeCustomerPassword(
      session.account.id,
      session.account.email,
      payload.currentPassword || "",
      payload.newPassword || "",
    );
    const newSession = await createCustomerSession(session.account.id);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      CUSTOMER_SESSION_COOKIE,
      newSession.token,
      customerSessionCookieOptions,
    );
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível alterar a senha.",
      },
      { status: 400 },
    );
  }
}
