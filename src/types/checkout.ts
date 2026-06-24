export type DeliveryMethod = "correios" | "retirada";

export type CheckoutData = {
  fullName: string;
  whatsapp: string;
  email: string;
  cpf: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  deliveryMethod: DeliveryMethod;
  notes: string;
};

export type CheckoutCartItem = {
  productId: string;
  quantity: number;
};

export type CheckoutSessionResponse = {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  shipping: number;
  total: number;
};

export type PaymentResult = {
  orderId: string;
  paymentId: string;
  status: string;
  statusDetail: string;
  redirectUrl: string;
};
