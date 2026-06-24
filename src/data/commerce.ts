import type { DeliveryMethod } from "@/types/checkout";

const readMoney = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const commerce = {
  standardShippingPrice: readMoney(
    process.env.STANDARD_SHIPPING_PRICE,
    18.9,
  ),
  freeShippingThreshold: readMoney(
    process.env.FREE_SHIPPING_THRESHOLD,
    199,
  ),
};

export const calculateShipping = (
  subtotal: number,
  method: DeliveryMethod,
) => {
  if (method === "retirada") return 0;
  if (subtotal >= commerce.freeShippingThreshold) return 0;
  return commerce.standardShippingPrice;
};
