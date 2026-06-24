export type SubscriptionFrequency = "Mensal" | "Bimestral";
export type SubscriptionGrind = "Em grãos" | "Moído para coador/filtro";

export type SubscriptionOption = {
  id: string;
  label: string;
  coffee: string;
  quantity: string;
  amount: number;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  product: string;
  options: SubscriptionOption[];
  idealFor: string;
  benefits: string[];
  badge?: string;
  featured?: boolean;
};

export type SubscriptionCustomer = {
  fullName: string;
  email: string;
  cpf: string;
  whatsapp: string;
};

export type SubscriptionAddress = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type StoredSubscription = {
  id: string;
  customerAccountId: string | null;
  subscriptionNumber: string;
  mercadoPagoId: string | null;
  status: string;
  customer: SubscriptionCustomer;
  address: SubscriptionAddress;
  planId: string;
  planName: string;
  optionId: string;
  coffee: string;
  quantity: string;
  grind: SubscriptionGrind;
  frequencyMonths: number;
  amount: number;
  paymentMethod: string | null;
  nextPaymentDate: string | null;
  lastError: string;
  createdAt: string;
  updatedAt: string;
};
