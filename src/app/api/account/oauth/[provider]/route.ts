import { NextResponse } from "next/server";
import {
  isCustomerOAuthProvider,
  startCustomerOAuth,
} from "@/lib/customer-oauth";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isCustomerOAuthProvider(provider)) {
    return NextResponse.json(
      { error: "Provedor de login inválido." },
      { status: 404 },
    );
  }
  return startCustomerOAuth(request, provider);
}
