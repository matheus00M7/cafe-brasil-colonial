import "server-only";

import { createHash, randomUUID } from "node:crypto";
import {
  createSubscriptionRecord,
  getSubscriptionById,
  getSubscriptionByMercadoPagoId,
  updateSubscriptionRecord,
} from "@/lib/subscriptions-db";
import {
  createPendingProviderSubscription,
  createProviderSubscription,
  getProviderSubscription,
  updateProviderSubscription,
  type MercadoPagoSubscription,
} from "@/lib/subscriptions/mercado-pago-client";
import {
  normalizeSubscriptionError,
  SubscriptionError,
} from "@/lib/subscriptions/errors";
import {
  validateCreateSubscription,
  type CreateSubscriptionPayload,
} from "@/lib/subscriptions/validation";
import { createAppLog } from "@/lib/app-logs";

const subscriptionNumber = () =>
  `ASS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID()
    .slice(0, 6)
    .toUpperCase()}`;

const saveProviderState = async (
  localId: string,
  provider: MercadoPagoSubscription,
  fallbackPaymentMethod?: string | null,
) =>
  updateSubscriptionRecord(localId, {
    mercadoPagoId: String(provider.id),
    status: provider.status,
    paymentMethod:
      provider.payment_method_id || fallbackPaymentMethod || null,
    nextPaymentDate: provider.next_payment_date || null,
    lastError: "",
  });

const isCardTokenServiceError = (error: SubscriptionError) => {
  const detail = `${error.detail || error.message}`.toLowerCase();
  return (
    error.code === "PROVIDER_REJECTED" &&
    (detail.includes("card token service not found") ||
      detail.includes("token service not found"))
  );
};

export const createSubscription = async (
  payload: CreateSubscriptionPayload,
  customerAccountId?: string | null,
) => {
  const input = await validateCreateSubscription(payload);
  const localId = randomUUID();
  const managementToken = `${randomUUID()}${randomUUID()}`;

  await createSubscriptionRecord({
    id: localId,
    customerAccountId: customerAccountId || null,
    subscriptionNumber: subscriptionNumber(),
    customer: input.customer,
    address: input.address,
    planId: input.plan.id,
    planName: input.plan.name,
    optionId: input.option.id,
    coffee: input.option.coffee,
    quantity: input.option.quantity,
    grind: input.grind,
    frequencyMonths: input.frequencyMonths,
    amount: input.option.amount,
    managementTokenHash: createHash("sha256")
      .update(managementToken)
      .digest("hex"),
  });

  try {
    const provider = await createProviderSubscription({
      localId,
      reason: `${input.plan.name} - ${input.option.label}`,
      customerEmail: input.customer.email,
      cardTokenId: input.cardTokenId,
      amount: input.option.amount,
      frequencyMonths: input.frequencyMonths,
      managementToken,
    });
    await saveProviderState(localId, provider, input.paymentMethodId);
    return {
      subscriptionId: localId,
      status: provider.status,
      redirectUrl: `/assinatura/sucesso?id=${localId}&token=${encodeURIComponent(
        managementToken,
      )}`,
    };
  } catch (error) {
    const normalized = normalizeSubscriptionError(error);
    console.warn("[subscriptions] Mercado Pago subscription failed", {
      code: normalized.code,
      status: normalized.status,
      detail: normalized.detail || normalized.message,
    });

    if (isCardTokenServiceError(normalized)) {
      await createAppLog({
        level: "warn",
        area: "assinaturas",
        event: "subscription_authorized_fallback_to_pending",
        message:
          "Token do cartão recusado pelo Mercado Pago. Criando assinatura pendente com link oficial de pagamento.",
        entityType: "subscription",
        entityId: localId,
        details: {
          code: normalized.code,
          detail: normalized.detail || normalized.message,
          planId: input.plan.id,
          optionId: input.option.id,
          amount: input.option.amount,
          frequencyMonths: input.frequencyMonths,
        },
      });

      try {
        const pendingProvider = await createPendingProviderSubscription({
          localId,
          reason: `${input.plan.name} - ${input.option.label}`,
          customerEmail: input.customer.email,
          amount: input.option.amount,
          frequencyMonths: input.frequencyMonths,
          managementToken,
        });
        await saveProviderState(localId, pendingProvider, input.paymentMethodId);

        return {
          subscriptionId: localId,
          status: pendingProvider.status,
          redirectUrl:
            pendingProvider.init_point ||
            `/assinatura/sucesso?id=${localId}&token=${encodeURIComponent(
              managementToken,
            )}`,
        };
      } catch (pendingError) {
        const pendingNormalized = normalizeSubscriptionError(pendingError);
        await createAppLog({
          level: pendingNormalized.status >= 500 ? "error" : "warn",
          area: "assinaturas",
          event: "subscription_pending_fallback_failed",
          message:
            "Também não foi possível criar a assinatura pendente no Mercado Pago.",
          entityType: "subscription",
          entityId: localId,
          details: {
            code: pendingNormalized.code,
            status: pendingNormalized.status,
            detail: pendingNormalized.detail || pendingNormalized.message,
            planId: input.plan.id,
            optionId: input.option.id,
          },
        });
      }
    }

    await createAppLog({
      level: normalized.status >= 500 ? "error" : "warn",
      area: "assinaturas",
      event: "subscription_create_failed",
      message: "Falha ao criar assinatura no Mercado Pago.",
      entityType: "subscription",
      entityId: localId,
      details: {
        code: normalized.code,
        status: normalized.status,
        detail: normalized.detail || normalized.message,
        planId: input.plan.id,
        optionId: input.option.id,
        amount: input.option.amount,
        frequencyMonths: input.frequencyMonths,
      },
    });
    await updateSubscriptionRecord(localId, {
      status: "error",
      lastError: `${normalized.code}: ${
        normalized.detail || normalized.message
      }`,
    }).catch(() => {});
    throw normalized;
  }
};

export const syncSubscription = async (localId: string) => {
  const subscription = await getSubscriptionById(localId);
  if (!subscription) {
    throw new SubscriptionError(
      "Assinatura não encontrada.",
      "NOT_FOUND",
      404,
    );
  }
  if (!subscription.mercadoPagoId) return subscription;

  const provider = await getProviderSubscription(subscription.mercadoPagoId);
  return (
    (await saveProviderState(subscription.id, provider)) || subscription
  );
};

export const changeSubscriptionStatus = async (
  localId: string,
  action: "pause" | "resume" | "cancel",
) => {
  const subscription = await getSubscriptionById(localId);
  if (!subscription?.mercadoPagoId) {
    throw new SubscriptionError(
      "Assinatura não encontrada no Mercado Pago.",
      "NOT_FOUND",
      404,
    );
  }
  const status =
    action === "pause"
      ? "paused"
      : action === "resume"
        ? "authorized"
        : "cancelled";
  const provider = await updateProviderSubscription(
    subscription.mercadoPagoId,
    status,
  );
  return saveProviderState(subscription.id, provider);
};

export const syncSubscriptionWebhook = async (providerId: string) => {
  const provider = await getProviderSubscription(providerId);
  const subscription = provider.external_reference
    ? await getSubscriptionById(provider.external_reference)
    : await getSubscriptionByMercadoPagoId(providerId);
  if (!subscription) return null;
  return saveProviderState(subscription.id, provider);
};
