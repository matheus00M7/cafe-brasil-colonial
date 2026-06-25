import "server-only";

import { SubscriptionError } from "@/lib/subscriptions/errors";

export type MercadoPagoSubscription = {
  id: string;
  status: string;
  reason?: string;
  external_reference?: string;
  payer_email?: string;
  init_point?: string;
  payment_method_id?: string;
  next_payment_date?: string;
  auto_recurring?: {
    frequency?: number;
    frequency_type?: string;
    transaction_amount?: number;
    currency_id?: string;
  };
};

type MercadoPagoErrorPayload = {
  message?: string;
  error?: string;
  status?: number;
  cause?: Array<{
    code?: string | number;
    description?: string;
  }>;
};

type ScopeMode = "stage" | "default";

const apiUrl = (
  process.env.MERCADO_PAGO_API_URL || "https://api.mercadopago.com"
).replace(/\/$/, "");

const getConfiguration = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() || "";
  const publicKey =
    process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.trim() || "";
  if (!accessToken || !publicKey) {
    throw new SubscriptionError(
      "As credenciais do Mercado Pago não estão configuradas.",
      "NOT_CONFIGURED",
      503,
    );
  }

  const tokenIsTest = accessToken.startsWith("TEST-");
  const keyIsTest = publicKey.startsWith("TEST-");
  const tokenIsProduction = accessToken.startsWith("APP_USR-");
  const keyIsProduction = publicKey.startsWith("APP_USR-");
  if (
    (!tokenIsTest && !tokenIsProduction) ||
    (!keyIsTest && !keyIsProduction) ||
    tokenIsTest !== keyIsTest
  ) {
    throw new SubscriptionError(
      "A Public Key e o Access Token precisam ser do mesmo ambiente.",
      "NOT_CONFIGURED",
      503,
    );
  }

  return {
    accessToken,
    isTest: tokenIsTest,
    testPayerEmail:
      process.env.MERCADO_PAGO_TEST_PAYER_EMAIL?.trim() ||
      "test_payer@testuser.com",
  };
};

const readPayload = async (response: Response) => {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as MercadoPagoErrorPayload;
  } catch {
    return { message: raw.slice(0, 500) } satisfies MercadoPagoErrorPayload;
  }
};

const technicalMessage = (payload: MercadoPagoErrorPayload) =>
  payload.cause?.[0]?.description ||
  payload.message ||
  payload.error ||
  "Solicitação recusada pelo Mercado Pago.";

const technicalCode = (payload: MercadoPagoErrorPayload) =>
  String(payload.cause?.[0]?.code || payload.error || "");

const providerError = (
  response: Response,
  payload: MercadoPagoErrorPayload,
) => {
  const detail = technicalMessage(payload);
  const normalized = `${technicalCode(payload)} ${detail}`.toLowerCase();

  if (
    response.status === 401 ||
    response.status === 403 ||
    normalized.includes("unauthorized") ||
    normalized.includes("policy")
  ) {
    return new SubscriptionError(
      "O Mercado Pago não autorizou esta aplicação a criar assinaturas nesse ambiente.",
      "PROVIDER_UNAUTHORIZED",
      502,
      detail,
    );
  }
  if (response.status >= 500) {
    return new SubscriptionError(
      "O Mercado Pago está temporariamente indisponível. Tente novamente em alguns minutos.",
      "PROVIDER_UNAVAILABLE",
      503,
      detail,
    );
  }
  if (
    normalized.includes("card token") ||
    normalized.includes("token service")
  ) {
    return new SubscriptionError(
      "O Mercado Pago não reconheceu o token do cartão neste ambiente. Recarregue os campos do cartão e tente novamente.",
      "PROVIDER_REJECTED",
      422,
      detail,
    );
  }
  return new SubscriptionError(
    "O Mercado Pago recusou a criação da assinatura.",
    "PROVIDER_REJECTED",
    422,
    detail,
  );
};

const request = async <T>(
  path: string,
  init: RequestInit,
  scope: ScopeMode,
) => {
  const { accessToken } = getConfiguration();
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...(scope === "stage" ? { "X-scope": "stage" } : {}),
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new SubscriptionError(
      "Não foi possível conectar ao Mercado Pago. Tente novamente.",
      "PROVIDER_UNAVAILABLE",
      503,
      error instanceof Error ? error.message : "",
    );
  }

  const payload = await readPayload(response);
  if (!response.ok) throw providerError(response, payload);
  return payload as T;
};

const getTestScopePreference = () => {
  const configured =
    process.env.MERCADO_PAGO_SUBSCRIPTIONS_TEST_SCOPE?.toLowerCase();
  if (configured === "default" || configured === "stage") return configured;
  return "auto";
};

const shouldRetryWithoutStage = (error: unknown) => {
  if (!(error instanceof SubscriptionError)) return false;
  const detail = `${error.code} ${error.detail || error.message}`.toLowerCase();
  return (
    error.code === "PROVIDER_UNAUTHORIZED" ||
    error.code === "PROVIDER_UNAVAILABLE" ||
    detail.includes("card token service not found") ||
    detail.includes("token service not found")
  );
};

const requestWithEnvironment = async <T>(
  path: string,
  init: RequestInit,
) => {
  const { isTest } = getConfiguration();
  if (!isTest) return request<T>(path, init, "default");

  const preference = getTestScopePreference();
  if (preference === "default") return request<T>(path, init, "default");

  try {
    return await request<T>(path, init, "stage");
  } catch (error) {
    if (shouldRetryWithoutStage(error)) {
      return request<T>(path, init, "default");
    }
    throw error;
  }
};

export const createProviderSubscription = async (input: {
  localId: string;
  reason: string;
  customerEmail: string;
  cardTokenId: string;
  amount: number;
  frequencyMonths: number;
  managementToken: string;
}) => {
  const { isTest, testPayerEmail } = getConfiguration();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const body = {
    reason: input.reason,
    external_reference: input.localId,
    payer_email: isTest ? testPayerEmail : input.customerEmail,
    card_token_id: input.cardTokenId,
    auto_recurring: {
      frequency: input.frequencyMonths,
      frequency_type: "months",
      transaction_amount: Number(input.amount.toFixed(2)),
      currency_id: "BRL",
    },
    back_url: `${siteUrl}/assinatura/sucesso?id=${
      input.localId
    }&token=${encodeURIComponent(input.managementToken)}`,
    notification_url: siteUrl.startsWith("https://")
      ? `${siteUrl}/api/webhooks/mercado-pago`
      : undefined,
    status: "authorized",
  };

  return requestWithEnvironment<MercadoPagoSubscription>("/preapproval", {
    method: "POST",
    headers: { "X-Idempotency-Key": input.localId },
    body: JSON.stringify(body),
  });
};

export const getProviderSubscription = (id: string) =>
  requestWithEnvironment<MercadoPagoSubscription>(
    `/preapproval/${encodeURIComponent(id)}`,
    { method: "GET" },
  );

export const updateProviderSubscription = (
  id: string,
  status: "authorized" | "paused" | "cancelled",
) =>
  requestWithEnvironment<MercadoPagoSubscription>(
    `/preapproval/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({ status }),
    },
  );
