import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions } from "@/lib/admin-auth";
import { assertSameOrigin } from "@/lib/request-security";

export async function POST(request: Request) {
  assertSameOrigin(request);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    ...adminCookieOptions,
    maxAge: 0,
  });
  return response;
}
