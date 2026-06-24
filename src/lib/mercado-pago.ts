import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { OrderStatus, StoredOrder } from "@/types/order";

type MercadoPagoPayment = {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  payment_method_id?: string;
  payment_type_id?: string;
  metadata?: { order_id?: string };
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
  transaction_details?: {
    external_resource_url?: string;
  };
};

type BrickFormData = {
  token?: string;
  issuer_id?: string | number;
  payment_method_id?: string;
  payment_type_id?: string;
  transaction_amount?: number;
  installments?: number;
  payer?: {
    email?: string;
    identification?: {
      type?: string;
      number?: string;
    };
  };
};

const getAccessToken = () => {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "O Access Token do Mercado Pago ainda não foi configurado.",
    );
  }
  return token;
};

const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as T & {
    message?: string;
    cause?: Array<{ description?: string }>;
  };

  if (!response.ok) {
    const reason =
      payload.cause?.[0]?.description ||
      payload.message ||
      "O Mercado Pago recusou a solicitação.";
    throw new Error(reason);
  }

  return payload;
};

const splitName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || fullName,
    lastName: parts.slice(1).join(" ") || undefined,
  };
};

export const mapPaymentStatus = (status: string): OrderStatus => {
  const statuses: Record<string, OrderStatus> = {
    approved: "approved",
    pending: "pending",
    in_process: "in_process",
    rejected: "rejected",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "charged_back",
  };
  return statuses[status] || "pending";
};

export const createMercadoPagoPayment = async (
  order: StoredOrder,
  formData: BrickFormData,
  paymentAttemptId: string,
) => {
  if (!formData.payment_method_id) {
    throw new Error("Escolha uma forma de pagamento.");
  }

  const { firstName, lastName } = splitName(order.customer.fullName);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const notificationUrl = siteUrl.startsWith("https://")
    ? `${siteUrl}/api/webhooks/mercado-pago`
    : undefined;
  const isTicket =
    formData.payment_type_id === "ticket" ||
    formData.payment_method_id === "bolbradesco";
  const ticketExpiration = new Date(
    Date.now() + 5 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const body = {
    transaction_amount: order.total,
    token: formData.token || undefined,
    description: `Pedido ${order.orderNumber} - Café Brasil Colonial`,
    installments: Number(formData.installments || 1),
    payment_method_id: formData.payment_method_id,
    issuer_id: formData.issuer_id || undefined,
    date_of_expiration: isTicket ? ticketExpiration : undefined,
    external_reference: order.id,
    notification_url: notificationUrl,
    metadata: {
      order_id: order.id,
      order_number: order.orderNumber,
      payment_attempt_id: paymentAttemptId,
    },
    payer: {
      email: order.customer.email,
      first_name: firstName,
      last_name: lastName,
      identification: order.customer.cpf
        ? { type: "CPF", number: order.customer.cpf }
        : formData.payer?.identification,
      address: {
        zip_code: order.address.cep,
        street_name: order.address.street,
        street_number: order.address.number,
        neighborhood: order.address.neighborhood,
        city: order.address.city,
        federal_unit: order.address.state,
      },
    },
    additional_info: {
      items: order.items.map((item) => ({
        id: item.productId,
        title: item.name,
        description: item.name,
        category_id: "food",
        quantity: item.quantity,
        unit_price: item.unitPrice,
      })),
      payer: {
        first_name: firstName,
        last_name: lastName,
        phone: {
          number: order.customer.whatsapp.replace(/\D/g, ""),
        },
      },
      shipments: {
        receiver_address: {
          zip_code: order.address.cep,
          street_name: order.address.street,
          street_number: order.address.number,
          floor: order.address.complement || undefined,
          apartment: order.address.complement || undefined,
          city_name: order.address.city,
          state_name: order.address.state,
        },
      },
    },
  };

  return apiRequest<MercadoPagoPayment>("/v1/payments", {
    method: "POST",
    headers: {
      "X-Idempotency-Key": paymentAttemptId,
    },
    body: JSON.stringify(body),
  });
};

export const getMercadoPagoPayment = (paymentId: string) =>
  apiRequest<MercadoPagoPayment>(`/v1/payments/${paymentId}`);

export const paymentUpdateFromResponse = (payment: MercadoPagoPayment) => {
  const transactionData = payment.point_of_interaction?.transaction_data;
  return {
    status: mapPaymentStatus(payment.status),
    paymentStatus: payment.status,
    paymentStatusDetail: payment.status_detail || null,
    paymentId: String(payment.id),
    paymentMethod: payment.payment_method_id || null,
    paymentType: payment.payment_type_id || null,
    pixQrCode: transactionData?.qr_code || null,
    pixQrCodeBase64: transactionData?.qr_code_base64 || null,
    ticketUrl:
      transactionData?.ticket_url ||
      payment.transaction_details?.external_resource_url ||
      null,
  };
};

export const getPaymentOrderId = (payment: MercadoPagoPayment) =>
  payment.metadata?.order_id || payment.external_reference || null;

export const validateWebhookSignature = ({
  xSignature,
  xRequestId,
  dataId,
}: {
  xSignature: string | null;
  xRequestId: string | null;
  dataId: string | null;
}) => {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!xSignature || !xRequestId || !dataId) return false;

  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = parts.ts;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`;
  const expected = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
};
