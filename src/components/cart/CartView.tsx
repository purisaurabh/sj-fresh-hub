"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Banknote, Minus, Plus, ShoppingBasket, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { selectCartTotals, useCartStore, type CartItem } from "@/features/cart/store";
import { formatQuantity } from "@/components/orders/order-status-meta";
import { formatInr, formatPriceWithUnit, lineTotal } from "@/lib/money";

type CartViewProps = {
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
};

function QuantityStepper({ item }: { item: CartItem }) {
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const atMax = item.quantity + item.quantityStep > item.stockQuantity + 1e-8;

  return (
    <div
      className="flex h-9 w-[108px] items-center justify-between overflow-hidden rounded-lg bg-forest text-white sm:h-10 sm:w-[132px]"
      role="group"
      aria-label={`${item.name} quantity`}
    >
      <button
        type="button"
        onClick={() => decrement(item.productId)}
        className="flex h-full w-8 shrink-0 items-center justify-center hover:bg-white/15 focus-visible:outline-none sm:w-10"
        aria-label={item.quantity <= item.quantityStep ? `Remove ${item.name} from cart` : `Decrease ${item.name}`}
      >
        <Minus className="size-3.5 sm:size-4" />
      </button>
      <span className="min-w-0 truncate px-0.5 text-center text-xs font-semibold tabular-nums sm:px-1 sm:text-sm" aria-live="polite">
        {formatQuantity(item.quantity)}{" "}
        <span className="text-[10px] font-normal opacity-85">{item.unit}</span>
      </span>
      <button
        type="button"
        onClick={() => {
          if (atMax) {
            toast.error(`Only ${formatQuantity(item.stockQuantity)} ${item.unit} available`);
            return;
          }
          increment(item.productId);
        }}
        className={`flex h-full w-8 shrink-0 items-center justify-center hover:bg-white/15 focus-visible:outline-none sm:w-10 ${atMax ? "opacity-50" : ""}`}
        aria-label={`Increase ${item.name}`}
        aria-disabled={atMax}
      >
        <Plus className="size-3.5 sm:size-4" />
      </button>
    </div>
  );
}

export function CartView({ deliveryFee, minimumOrder, isOpen }: CartViewProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const totals = selectCartTotals(items, deliveryFee);
  const [ready, setReady] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    const finish = () => setReady(true);
    if (useCartStore.persist.hasHydrated()) {
      finish();
    }
    return useCartStore.persist.onFinishHydration(finish);
  }, []);

  if (!ready) {
    return <BrandLoader />;
  }

  const removeTarget = items.find((item) => item.productId === removeId);
  const belowMinimum = minimumOrder > 0 && totals.subtotal + 1e-8 < minimumOrder;
  const canCheckout = isOpen && !belowMinimum && items.length > 0;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-mint text-forest">
          <ShoppingBasket className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-gray-900 md:text-2xl">Your cart is empty</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Fresh vegetables and fruits are a tap away. Add a few items and they will show up here.
        </p>
        <Button asChild className="mt-6 h-12 bg-forest px-6 text-white hover:bg-forest/90">
          <Link href="/">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 md:text-2xl">Your cart</h1>
          <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">
            {items.length} {items.length === 1 ? "item" : "items"} · Pay cash when your order is delivered
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-xl border-forest/20 bg-mint text-sm font-semibold text-forest shadow-none hover:bg-mint hover:text-forest"
          >
            <Link href="/">
              <Store className="size-3.5" aria-hidden="true" />
              <span className="sm:hidden">Shop more</span>
              <span className="hidden sm:inline">Continue shopping</span>
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-red-200 bg-red-50 text-sm font-semibold text-destructive shadow-none hover:bg-red-100 hover:text-destructive"
            onClick={() => setClearOpen(true)}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Clear cart
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.productId} className="rounded-xl border border-border bg-white p-2.5 shadow-sm sm:p-4">
              <div className="flex items-center gap-2.5">
                <Link href={`/product/${item.slug}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-mint text-xs font-semibold text-forest sm:size-16 sm:rounded-xl sm:text-sm">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="size-full object-cover" />
                    ) : (
                      item.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900 sm:text-base">{item.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {formatPriceWithUnit(item.unitPrice, item.unit)}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-forest">
                      {formatInr(lineTotal(item.unitPrice, item.quantity))}
                    </span>
                  </span>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <QuantityStepper item={item} />
                  <button
                    type="button"
                    onClick={() => setRemoveId(item.productId)}
                    className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-destructive"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">Bill summary</h2>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Item total</dt>
                <dd>{formatInr(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery fee</dt>
                <dd className={totals.deliveryFee === 0 ? "font-medium text-forest" : undefined}>
                  {totals.deliveryFee === 0 ? "FREE" : formatInr(totals.deliveryFee)}
                </dd>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-dashed border-border pt-3">
                <dt className="font-semibold text-gray-900">To pay in cash</dt>
                <dd className="text-lg font-bold text-gray-900">{formatInr(totals.total)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-mint/50 px-3 py-2.5 text-sm text-forest">
              <Banknote className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>Cash on Delivery. Pay the delivery person when your order arrives.</p>
            </div>
            {!isOpen ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                The shop is closed right now. You can keep items in your cart and check out when ordering opens.
              </p>
            ) : null}
            {belowMinimum ? (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                Add {formatInr(minimumOrder - totals.subtotal)} more to reach the minimum order of {formatInr(minimumOrder)}.
              </p>
            ) : null}
            <Button
              asChild={canCheckout}
              className="mt-4 h-12 w-full bg-forest text-white hover:bg-forest/90"
              disabled={!canCheckout}
            >
              {canCheckout ? <Link href="/checkout">Continue to checkout</Link> : <span>Continue to checkout</span>}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">Prices and stock are confirmed again at checkout.</p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title={`Remove ${removeTarget?.name ?? "this item"}?`}
        description="You can add it again from the shop."
        confirmLabel="Remove"
        cancelLabel="Keep"
        destructive
        onOpenChange={(open) => {
          if (!open) {
            setRemoveId(null);
          }
        }}
        onConfirm={() => {
          if (removeId) {
            removeItem(removeId);
          }
          setRemoveId(null);
        }}
      />
      <ConfirmDialog
        open={clearOpen}
        title="Clear your cart?"
        description="All items will be removed. This cannot be undone."
        confirmLabel="Clear cart"
        cancelLabel="Keep items"
        destructive
        onOpenChange={setClearOpen}
        onConfirm={() => {
          clear();
          setClearOpen(false);
        }}
      />
    </div>
  );
}
