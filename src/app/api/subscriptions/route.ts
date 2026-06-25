import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSubscription } from "@/lib/subscriptions/service";
import {
  normalizeSubscriptionError,
  type SubscriptionError,
} from "@/lib/subscriptions/errors";
import type { CreateSubscriptionPayload } from "@/lib/subscriptions/validation";
import { getCustomerSession } from "@/lib/customer-auth";
import { createAppLog } from "@/lib/app-logs";

export const runtime = "nodejs";

const errorResponse = (error: unknown) => {
  const normalized = normalizeSubscriptionError(error);
  const body: {
    error: string;
    code: SubscriptionError["code"];
    detail?: string;
  } = {
    error: normalized.message,
    code: normalized.code,
  };
  if (normalized.detail) {
    body.detail = normalized.detail;
  }
  return NextResponse.json(body, { status: normalized.status });
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (!checkRateLimit(`subscription:create:${ip}`, 5)) {
    return NextResponse.json(
      {
        error: "Muitas tentativas. Aguarde um minuto e tente novamente.",
        code: "ACCESS_DENIED",
      },
      { status: 429 },
    );
  }

  try {
    const payload = (await request.json()) as CreateSubscriptionPayload;
    const session = await getCustomerSession();
    if (session && payload.customer) {
      payload.customer.email = session.account.email;
    }
    return NextResponse.json(
      await createSubscription(payload, session?.account.id),
      {
      status: 201,
      },
    );
  } catch (error) {
    const normalized = normalizeSubscriptionError(error);
    await createAppLog({
      level: normalized.status >= 500 ? "error" : "warn",
      area: "assinaturas",
      event: "subscription_api_failed",
      message: "A API de assinatura retornou erro.",
      requestPath: request.nextUrl.pathname,
      details: {
        code: normalized.code,
        status: normalized.status,
        detail: normalized.detail || normalized.message,
      },
    });
    return errorResponse(error);
  }
}
