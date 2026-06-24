import { NextResponse } from "next/server";
import {
  getSubscriptionById,
  verifySubscriptionManagementToken,
} from "@/lib/subscriptions-db";
import {
  changeSubscriptionStatus,
  syncSubscription,
} from "@/lib/subscriptions/service";
import {
  normalizeSubscriptionError,
  SubscriptionError,
} from "@/lib/subscriptions/errors";
import { getCustomerSession } from "@/lib/customer-auth";
import { assertSameOrigin } from "@/lib/request-security";

export const runtime = "nodejs";

const publicSubscription = (
  subscription: NonNullable<
    Awaited<ReturnType<typeof getSubscriptionById>>
  >,
) => ({
  id: subscription.id,
  subscriptionNumber: subscription.subscriptionNumber,
  status: subscription.status,
  planName: subscription.planName,
  coffee: subscription.coffee,
  quantity: subscription.quantity,
  grind: subscription.grind,
  frequencyMonths: subscription.frequencyMonths,
  amount: subscription.amount,
  nextPaymentDate: subscription.nextPaymentDate,
  customerName: subscription.customer.fullName,
  city: subscription.address.city,
  state: subscription.address.state,
});

const errorResponse = (error: unknown) => {
  const normalized = normalizeSubscriptionError(error);
  return NextResponse.json(
    {
      error: normalized.message,
      code: normalized.code,
      ...(process.env.NODE_ENV !== "production" && normalized.detail
        ? { detail: normalized.detail }
        : {}),
    },
    { status: normalized.status },
  );
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const local = await getSubscriptionById(id);
    if (!local) {
      throw new SubscriptionError(
        "Assinatura não encontrada.",
        "NOT_FOUND",
        404,
      );
    }
    if (local.customerAccountId) {
      const session = await getCustomerSession();
      if (session?.account.id !== local.customerAccountId) {
        throw new SubscriptionError(
          "Assinatura não encontrada.",
          "NOT_FOUND",
          404,
        );
      }
    }
    try {
      return NextResponse.json(publicSubscription(await syncSubscription(id)));
    } catch {
      return NextResponse.json(publicSubscription(local));
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    const { id } = await params;
    const payload = (await request.json()) as {
      token?: string;
      action?: "pause" | "resume" | "cancel";
    };
    const subscription = await getSubscriptionById(id);
    const session = await getCustomerSession();
    const ownsSubscription =
      Boolean(subscription?.customerAccountId) &&
      subscription?.customerAccountId === session?.account.id;
    const hasManagementToken =
      Boolean(payload.token) &&
      (await verifySubscriptionManagementToken(id, payload.token as string));
    if (!ownsSubscription && !hasManagementToken) {
      throw new SubscriptionError(
        "O link de gerenciamento é inválido.",
        "ACCESS_DENIED",
        401,
      );
    }
    if (
      payload.action !== "pause" &&
      payload.action !== "resume" &&
      payload.action !== "cancel"
    ) {
      throw new SubscriptionError(
        "Ação de assinatura inválida.",
        "INVALID_INPUT",
        400,
      );
    }
    const updated = await changeSubscriptionStatus(id, payload.action);
    return NextResponse.json({
      ok: true,
      status: updated?.status,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
