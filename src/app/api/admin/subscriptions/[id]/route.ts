import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { changeSubscriptionStatus } from "@/lib/subscriptions/service";
import {
  normalizeSubscriptionError,
  SubscriptionError,
} from "@/lib/subscriptions/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await getAdminSession())) {
      throw new SubscriptionError(
        "Não autorizado.",
        "ACCESS_DENIED",
        401,
      );
    }
    const { id } = await params;
    const payload = (await request.json()) as {
      action?: "pause" | "resume" | "cancel";
    };
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
    const subscription = await changeSubscriptionStatus(id, payload.action);
    return NextResponse.json({ ok: true, subscription });
  } catch (error) {
    const normalized = normalizeSubscriptionError(error);
    return NextResponse.json(
      { error: normalized.message, code: normalized.code },
      { status: normalized.status },
    );
  }
}
