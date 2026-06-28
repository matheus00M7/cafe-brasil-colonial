import type { Product, ProductSelectedOption } from "./product";

export type CartItem = {
  product: Product;
  quantity: number;
  selectedOptions?: ProductSelectedOption[];
};
