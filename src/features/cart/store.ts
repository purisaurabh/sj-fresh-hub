"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateCartTotals } from "@/lib/money";
import { isValidQuantityStep, nextQuantity } from "@/features/products/quantity";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  quantityStep: number;
  imageUrl: string | null;
  stockQuantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => boolean;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity) => {
        const qty = quantity ?? item.quantityStep;
        if (item.stockQuantity <= 0 || !isValidQuantityStep(qty, item.quantityStep)) {
          return false;
        }

        const existing = get().items.find((entry) => entry.productId === item.productId);
        if (!existing) {
          if (qty > item.stockQuantity) {
            return false;
          }
          set({ items: [...get().items, { ...item, quantity: qty }] });
          return true;
        }

        const next = existing.quantity + qty;
        if (next > item.stockQuantity) {
          return false;
        }

        set({
          items: get().items.map((entry) =>
            entry.productId === item.productId ? { ...entry, quantity: next, unitPrice: item.unitPrice, stockQuantity: item.stockQuantity } : entry,
          ),
        });
        return true;
      },
      setQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((entry) => {
            if (entry.productId !== productId) {
              return entry;
            }
            if (!isValidQuantityStep(quantity, entry.quantityStep) || quantity > entry.stockQuantity) {
              return entry;
            }
            return { ...entry, quantity };
          }),
        });
      },
      increment: (productId) => {
        const item = get().items.find((entry) => entry.productId === productId);
        if (!item) {
          return;
        }
        get().setQuantity(productId, nextQuantity(item.quantity, item.quantityStep, item.stockQuantity, 1));
      },
      decrement: (productId) => {
        const item = get().items.find((entry) => entry.productId === productId);
        if (!item) {
          return;
        }
        get().setQuantity(productId, nextQuantity(item.quantity, item.quantityStep, item.stockQuantity, -1));
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((entry) => entry.productId !== productId) });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: "sj-fresh-hub-cart",
    },
  ),
);

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return useCartStore.persist.hasHydrated();
  });

  useEffect(() => {
    if (useCartStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}

export function selectCartTotals(items: CartItem[], deliveryFee: number) {
  return calculateCartTotals(
    items.map((item) => ({ unitPrice: item.unitPrice, quantity: item.quantity })),
    deliveryFee,
  );
}
