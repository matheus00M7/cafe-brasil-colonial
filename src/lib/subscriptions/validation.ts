import "server-only";

import { getSubscriptionPlans } from "@/data/subscriptions";
import { getSiteContent } from "@/lib/orders-db";
import { SubscriptionError } from "@/lib/subscriptions/errors";
import type {
  SubscriptionAddress,
  SubscriptionCustomer,
  SubscriptionGrind,
} from "@/types/subscription";

export type CreateSubscriptionPayload = {
  planId?: unknown;
  optionId?: unknown;
  frequencyMonths?: unknown;
  grind?: unknown;
  customer?: Partial<Record<keyof SubscriptionCustomer, unknown>>;
  address?: Partial<Record<keyof SubscriptionAddress, unknown>>;
  cardTokenId?: unknown;
  paymentMethodId?: unknown;
};

const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const digits = (value: unknown, max: number) =>
  text(value, max * 3).replace(/\D/g, "").slice(0, max);

export const validateCreateSubscription = async (
  payload: CreateSubscriptionPayload,
) => {
  const content = await getSiteContent();
  const plans = getSubscriptionPlans(content.commerce.subscriptionPrices);
  const planId = text(payload.planId, 80);
  const optionId = text(payload.optionId, 80);
  const plan = plans.find((item) => item.id === planId);
  const option = plan?.options.find((item) => item.id === optionId);
  if (!plan || !option) {
    throw new SubscriptionError(
      "O plano selecionado não existe ou não está mais disponível.",
      "INVALID_INPUT",
      400,
    );
  }

  const frequencyMonths = Number(payload.frequencyMonths);
  if (frequencyMonths !== 1 && frequencyMonths !== 2) {
    throw new SubscriptionError(
      "Escolha uma frequência válida para a assinatura.",
      "INVALID_INPUT",
      400,
    );
  }

  const grind = text(payload.grind, 80) as SubscriptionGrind;
  if (grind !== "Em grãos" && grind !== "Moído para coador/filtro") {
    throw new SubscriptionError(
      "Escolha o formato do café.",
      "INVALID_INPUT",
      400,
    );
  }

  const cardTokenId = text(payload.cardTokenId, 300);
  if (!cardTokenId) {
    throw new SubscriptionError(
      "O cartão não foi autorizado pelo formulário seguro.",
      "INVALID_INPUT",
      400,
    );
  }

  const customer: SubscriptionCustomer = {
    fullName: text(payload.customer?.fullName),
    email: text(payload.customer?.email).toLowerCase(),
    cpf: digits(payload.customer?.cpf, 11),
    whatsapp: digits(payload.customer?.whatsapp, 15),
  };
  if (
    customer.fullName.length < 3 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ||
    customer.cpf.length !== 11 ||
    customer.whatsapp.length < 10
  ) {
    throw new SubscriptionError(
      "Confira nome, e-mail, CPF e WhatsApp.",
      "INVALID_INPUT",
      400,
    );
  }

  const address: SubscriptionAddress = {
    cep: digits(payload.address?.cep, 8),
    street: text(payload.address?.street),
    number: text(payload.address?.number, 40),
    complement: text(payload.address?.complement),
    neighborhood: text(payload.address?.neighborhood),
    city: text(payload.address?.city),
    state: text(payload.address?.state, 2).toUpperCase(),
  };
  if (
    address.cep.length !== 8 ||
    !address.street ||
    !address.number ||
    !address.neighborhood ||
    !address.city ||
    !/^[A-Z]{2}$/.test(address.state)
  ) {
    throw new SubscriptionError(
      "Preencha corretamente o endereço de entrega.",
      "INVALID_INPUT",
      400,
    );
  }

  return {
    plan,
    option,
    frequencyMonths,
    grind,
    customer,
    address,
    cardTokenId,
    paymentMethodId: text(payload.paymentMethodId, 80) || null,
  };
};
