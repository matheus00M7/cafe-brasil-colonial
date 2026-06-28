"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types/cart";
import type { Product, ProductSelectedOption } from "@/types/product";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: ProductSelectedOption[],
  ) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  removeItem: (cartKey: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = "cafe-brasil-colonial-cart";
const CartContext = createContext<CartContextValue | null>(null);

export const getCartItemKey = (item: CartItem) => {
  const options = (item.selectedOptions || [])
    .map((option) => `${option.optionId}:${option.value}`)
    .sort()
    .join("|");
  return options ? `${item.product.id}::${options}` : item.product.id;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartItem[]);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (
      product: Product,
      quantity = 1,
      selectedOptions: ProductSelectedOption[] = [],
    ) => {
      setItems((current) => {
        const nextItem: CartItem = { product, quantity, selectedOptions };
        const nextKey = getCartItemKey(nextItem);
        const existing = current.find(
          (item) => getCartItemKey(item) === nextKey,
        );
        if (existing) {
          return current.map((item) =>
            getCartItemKey(item) === nextKey
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...current, nextItem];
      });
    },
    [],
  );

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) =>
        current.filter((item) => getCartItemKey(item) !== cartKey),
      );
      return;
    }
    setItems((current) =>
      current.map((item) =>
        getCartItemKey(item) === cartKey ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((cartKey: string) => {
    setItems((current) =>
      current.filter((item) => getCartItemKey(item) !== cartKey),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
      ),
      hydrated,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, hydrated, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}
