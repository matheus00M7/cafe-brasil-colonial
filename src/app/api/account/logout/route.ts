import { NextResponse } from "next/server";
import {
  customerSessionCookieOptions,
  CUSTOMER_SESSION_COOKIE,
  deleteCustomerSession,
} from "@/lib/customer-auth";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const token = request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${CUSTOMER_SESSION_COOKIE}=`))
      ?.slice(CUSTOMER_SESSION_COOKIE.length + 1);
    await deleteCustomerSession(token);
  } catch {
    // A remoção do cookie local encerra a sessão mesmo se o banco estiver fora.
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CUSTOMER_SESSION_COOKIE, "", {
    ...customerSessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
