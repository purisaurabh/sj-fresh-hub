"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { AddressDialog } from "@/components/profile/AddressDialog";
import { AuthFormStatus } from "@/components/auth/AuthFormStatus";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/shop/EmptyState";
import { Button } from "@/components/ui/button";
import type { SavedAddress } from "@/features/addresses/queries";
import type { ActiveBuilding } from "@/features/buildings/queries";
import { placeOrder } from "@/features/orders/actions";
import { selectCartTotals, useCartStore } from "@/features/cart/store";
import { formatInr, formatPriceWithUnit, lineTotal } from "@/lib/money";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type CheckoutFormProps = {
  fullName: string;
  phone: string;
  addresses: SavedAddress[];
  buildings: ActiveBuilding[];
  defaultBuildingId?: string | null;
  isOpen: boolean;
  deliveryFee: number;
  minimumOrder: number;
  shopPhone: string | null;
};

export function CheckoutForm({
  fullName,
  phone,
  addresses,
  buildings,
  defaultBuildingId,
  isOpen,
  deliveryFee,
  minimumOrder,
  shopPhone,
}: CheckoutFormProps) {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const [addressId, setAddressId] = useState(
    addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id ?? "",
  );
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addressDialog, setAddressDialog] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string>();
  const totals = selectCartTotals(items, deliveryFee);
  const belowMinimum = totals.subtotal < minimumOrder;
  const needsAddress = addresses.length === 0 || !addressId;
  const editing = useMemo(
    () => addresses.find((address) => address.id === editingId) ?? addresses[0],
    [addresses, editingId],
  );

  useEffect(() => {
    const nextId = addresses.find((address) => address.is_default)?.id ?? addresses[0]?.id ?? "";
    if (nextId && nextId !== addressId) {
      setAddressId(nextId);
    }
  }, [addresses, addressId]);

  function requestPlaceOrder() {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!addressId) {
      setError("Save a delivery address first.");
      setAddressDialog("add");
      return;
    }
    setConfirmOpen(true);
  }

  async function onPlaceOrder() {
    setConfirmOpen(false);
    setPending(true);
    setError(undefined);
    const result = await withActionOverlay(() =>
      placeOrder({
        addressId,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        customerNote: note,
      }),
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add vegetables and fruits before checking out."
      />
    );
  }

  if (!isOpen) {
    return (
      <EmptyState
        title="Ordering is closed"
        description={
          shopPhone
            ? `The shop is not taking orders right now. Call ${shopPhone} if you need help.`
            : "The shop is not taking orders right now. Please try again later."
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2 text-sm">
            {fullName}
            <span className="mt-1 block text-muted-foreground">{phone}</span>
          </p>
          <Link href="/profile" className="mt-2 inline-flex min-h-11 items-center text-sm font-medium text-forest underline-offset-2 hover:underline">
            Update on profile
          </Link>
        </section>

        <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-lg font-semibold">Delivery address</h2>
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-forest hover:underline"
              onClick={() => setAddressDialog("add")}
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add New Address
            </button>
          </div>
          {addresses.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {addresses.map((address) => (
                <li key={address.id}>
                  <div className="flex items-start gap-2 rounded-lg border border-border p-3 has-checked:border-forest has-checked:bg-mint">
                    <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-start gap-3">
                      <input
                        type="radio"
                        name="addressId"
                        className="mt-1 size-4 accent-forest"
                        checked={addressId === address.id}
                        onChange={() => setAddressId(address.id)}
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">
                          {address.label ?? "Address"}
                          {address.is_default ? " · Default" : ""}
                        </span>
                        <span className="block text-sm">{address.line1}</span>
                        <span className="block text-sm text-muted-foreground">{address.building_name}</span>
                      </span>
                    </label>
                    <button
                      type="button"
                      className="inline-flex shrink-0 items-center gap-1 pt-0.5 text-sm font-semibold text-forest hover:underline"
                      onClick={() => {
                        setEditingId(address.id);
                        setAddressDialog("edit");
                      }}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Add a delivery address, then place the order.</p>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Payment</h2>
          <p className="mt-2 rounded-lg bg-mint px-3 py-2 text-sm font-medium text-forest">
            Cash on Delivery only. Pay the delivery person in cash.
          </p>
          <label className="mt-4 block space-y-2 text-sm">
            Note for the shop (optional)
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-input px-3 py-2 text-base"
              maxLength={200}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-xl border border-border bg-white p-4 sm:p-5 lg:sticky lg:top-4">
        <h2 className="text-lg font-semibold">Order review</h2>
        <ul className="space-y-2 text-sm">
          {items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-3">
              <span>
                {item.name}
                <span className="block text-muted-foreground">
                  {item.quantity} {item.unit} · {formatPriceWithUnit(item.unitPrice, item.unit)}
                </span>
              </span>
              <span className="font-medium">{formatInr(lineTotal(item.unitPrice, item.quantity))}</span>
            </li>
          ))}
        </ul>
        <p className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatInr(totals.subtotal)}</span>
        </p>
        <p className="flex justify-between text-sm">
          <span>Delivery</span>
          <span>{formatInr(totals.deliveryFee)}</span>
        </p>
        <p className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatInr(totals.total)}</span>
        </p>
        {belowMinimum ? (
          <p className="text-sm text-destructive">
            Minimum order is {formatInr(minimumOrder)}. Add a few more items to continue.
          </p>
        ) : null}
        {needsAddress ? (
          <p className="text-sm text-destructive">Add a delivery address to place this order.</p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Prices and stock are confirmed on the server when you place the order.
        </p>
        <AuthFormStatus error={error} />
        <Button
          className="h-12 w-full bg-forest text-base"
          disabled={pending || needsAddress || belowMinimum}
          type="button"
          onClick={requestPlaceOrder}
        >
          {pending ? "Placing order…" : "Place Cash on Delivery order"}
        </Button>
      </aside>
      <AddressDialog
        open={addressDialog !== null}
        mode={addressDialog === "edit" ? "edit" : "add"}
        address={addressDialog === "edit" ? editing : undefined}
        buildings={buildings}
        defaultBuildingId={defaultBuildingId ?? buildings[0]?.id}
        isFirstAddress={addresses.length === 0}
        onOpenChange={(next) => {
          if (!next) {
            setAddressDialog(null);
          }
        }}
        onDone={() => {
          setAddressDialog(null);
          router.refresh();
        }}
      />
      <ConfirmDialog
        open={confirmOpen}
        title="Place this order?"
        description={`Pay ${formatInr(totals.total)} in cash on delivery. Please check the address and items before confirming.`}
        confirmLabel="Place order"
        pending={pending}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void onPlaceOrder()}
      />
    </div>
  );
}
