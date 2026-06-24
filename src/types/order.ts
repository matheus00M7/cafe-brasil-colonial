import type { DeliveryMethod } from "./checkout";

export type OrderStatus =
  | "pending_payment"
  | "pending"
  | "in_process"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

export type FulfillmentStatus =
  | "new"
  | "preparing"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export type StoredOrderItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type StoredCustomer = {
  fullName: string;
  whatsapp: string;
  email: string;
  cpf: string;
};

export type StoredAddress = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type StoredOrder = {
  id: string;
  customerAccountId: string | null;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string | null;
  paymentStatusDetail: string | null;
  paymentId: string | null;
  paymentMethod: string | null;
  paymentType: string | null;
  fulfillmentStatus: FulfillmentStatus;
  trackingCode: string;
  adminNotes: string;
  customer: StoredCustomer;
  address: StoredAddress;
  deliveryMethod: DeliveryMethod;
  notes: string;
  items: StoredOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  pixQrCode: string | null;
  pixQrCodeBase64: string | null;
  ticketUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicOrder = Omit<
  StoredOrder,
  "customer" | "address" | "adminNotes" | "customerAccountId"
> & {
  customer: Pick<StoredCustomer, "fullName">;
  address: Pick<StoredAddress, "city" | "state">;
};

export type OrderFilters = {
  query?: string;
  paymentStatus?: string;
  fulfillmentStatus?: string;
  limit?: number;
  offset?: number;
};

export type AdminDashboardStats = {
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  openFulfillment: number;
  approvedRevenue: number;
  averageTicket: number;
};
