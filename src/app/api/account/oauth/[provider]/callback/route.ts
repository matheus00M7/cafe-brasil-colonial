import { NextResponse } from "next/server";
import {
  finishCustomerOAuth,
  isCustomerOAuthProvider,
} from "@/lib/customer-oauth";

export const runtime = "nodejs";

const invalidProvider = () =>
  NextResponse.json(
    { error: "Provedor de login inválido." },
    { status: 404 },
  );

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isCustomerOAuthProvider(provider)) return invalidProvider();
  const url = new URL(request.url);
  return finishCustomerOAuth(request, provider, {
    code: url.searchParams.get("code"),
    state: url.searchParams.get("state"),
    error: url.searchParams.get("error"),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isCustomerOAuthProvider(provider)) return invalidProvider();
  const form = await request.formData();
  return finishCustomerOAuth(request, provider, {
    code: String(form.get("code") || ""),
    state: String(form.get("state") || ""),
    user: String(form.get("user") || ""),
    error: String(form.get("error") || ""),
  });
}
