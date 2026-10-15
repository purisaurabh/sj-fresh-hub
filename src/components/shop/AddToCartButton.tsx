"use client";

import { useSyncExternalStore } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem } from "@/features/cart/store";

type AddToCartButtonProps = {
  item: Omit<CartItem, "quantity">;
  disabled?: boolean;
};

const subscribeNoop = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(Number(quantity.toFixed(2)));
}

export function AddToCartButton({ item, disabled = false }: AddToCartButtonProps) {
  const isClient = useIsClient();
  const quantity = useCartStore(
    (state) => state.items.find((entry) => entry.productId === item.productId)?.quantity ?? 0,
  );
  const addItem = useCartStore((state) => state.addItem);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const inCart = isClient ? quantity : 0;

  function handleAdd() {
    if (disabled) {
      return;
    }
    if (addItem(item)) {
      toast.success(`${item.name} added to cart`);
    } else {
      toast.error("This item cannot be added right now.");
    }
  }

  function handleIncrement() {
    if (inCart + item.quantityStep > item.stockQuantity + 1e-8) {
      toast.error(`Only ${formatQuantity(item.stockQuantity)} ${item.unit} available`);
      return;
    }
    increment(item.productId);
  }

  if (disabled || inCart <= 0) {
    return (
      <Button
        type="button"
        className="h-11 w-full bg-forest text-white hover:bg-forest/90"
        disabled={disabled}
        onClick={handleAdd}
      >
        {disabled ? "Sold out" : "Add"}
      </Button>
    );
  }

  const atMax = inCart + item.quantityStep > item.stockQuantity + 1e-8;

  return (
    <div
      className="flex h-11 w-full items-center justify-between overflow-hidden rounded-lg bg-forest text-white"
      role="group"
      aria-label={`${item.name} quantity`}
    >
      <button
        type="button"
        onClick={() => decrement(item.productId)}
        className="flex h-full w-11 shrink-0 items-center justify-center hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none"
        aria-label={inCart <= item.quantityStep ? `Remove ${item.name} from cart` : `Decrease ${item.name}`}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-0 truncate px-1 text-sm font-semibold tabular-nums" aria-live="polite">
        {formatQuantity(inCart)}
        <span className="ml-1 text-xs font-normal opacity-85">{item.unit}</span>
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        className={`flex h-full w-11 shrink-0 items-center justify-center hover:bg-white/15 focus-visible:bg-white/15 focus-visible:outline-none ${atMax ? "opacity-50" : ""}`}
        aria-label={`Increase ${item.name}`}
        aria-disabled={atMax}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
