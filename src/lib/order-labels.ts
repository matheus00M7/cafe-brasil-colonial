import type { FulfillmentStatus, OrderStatus } from "@/types/order";

export const paymentStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Pagamento não iniciado",
  pending: "Aguardando pagamento",
  in_process: "Em análise",
  approved: "Pago",
  rejected: "Recusado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  charged_back: "Contestado",
};

export const fulfillmentStatusLabels: Record<FulfillmentStatus, string> = {
  new: "Novo pedido",
  preparing: "Em separação",
  ready: "Pronto para envio",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const paymentStatusTone: Record<
  OrderStatus,
  "green" | "yellow" | "red" | "neutral"
> = {
  pending_payment: "yellow",
  pending: "yellow",
  in_process: "yellow",
  approved: "green",
  rejected: "red",
  cancelled: "red",
  refunded: "neutral",
  charged_back: "red",
};
