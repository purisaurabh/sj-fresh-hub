"use client";

import Link from "next/link";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { cn } from "cn";
import { useCartStore } from "@/features/cart/store";

export function CartLink({
  className,
  variant = "icon",
  active = false,
}: {
  className?: string;
  variant?: "icon" | "tab";
  active?: boolean;
}) {
  const count = useCartStore((state) => state.items.length);
  const label = `Cart, ${count} items`;

  if (variant === "tab") {
    return (
      <Link
        href="/cart"
        className={cn(
          "relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors",
          active ? "bg-mint text-forest" : "text-gray-500 hover:bg-mint/50 hover:text-forest",
          className,
        )}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <span className="relative">
          <ShoppingCart className={`size-5 ${active ? "text-forest" : "text-gray-500"}`} aria-hidden="true" />
          {count > 0 ? (
            <span className="absolute -top-1.5 -right-2.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-sunshine px-1 text-[10px] font-bold text-gray-900">
              {count > 9 ? "9+" : count}
            </span>
          ) : null}
        </span>
        Cart
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className={cn(
        "relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-forest hover:bg-mint",
        className,
      )}
      aria-label={label}
    >
      <ShoppingBag className="size-5" />
      {count > 0 ? (
        <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-sunshine px-1 text-[10px] font-bold text-gray-900">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
