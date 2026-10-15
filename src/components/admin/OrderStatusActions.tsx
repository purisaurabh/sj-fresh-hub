"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { collectPayment, updateOrderStatus } from "@/features/admin/actions";
import { ADMIN_STATUS_TRANSITIONS, isOrderStatus, orderStatusActionLabel } from "@/features/orders/status";
import type { OrderStatus } from "@/lib/constants";
import { withActionOverlay } from "@/lib/ui/action-overlay";

const destructive: OrderStatus[] = ["rejected", "cancelled"];

export function OrderStatusActions({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: string;
  paymentStatus: string;
}) {
  const [pending, setPending] = useState<string>();
  const [confirmStatus, setConfirmStatus] = useState<OrderStatus>();
  const [note, setNote] = useState("");
  const next = isOrderStatus(status) ? ADMIN_STATUS_TRANSITIONS[status] : [];
  const canCollect =
    paymentStatus !== "collected" && (status === "out_for_delivery" || status === "delivered");

  async function applyStatus(nextStatus: OrderStatus) {
    setConfirmStatus(undefined);
    setPending(nextStatus);
    const result = await withActionOverlay(() =>
      updateOrderStatus({ orderId, status: nextStatus, note: note || undefined }),
    );
    setPending(undefined);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
    setNote("");
  }

  function onStatus(nextStatus: OrderStatus) {
    if (destructive.includes(nextStatus)) {
      setConfirmStatus(nextStatus);
      return;
    }
    void applyStatus(nextStatus);
  }

  async function onCollect() {
    setPending("collect");
    const result = await withActionOverlay(() => collectPayment(orderId));
    setPending(undefined);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
  }

  if (next.length === 0 && !canCollect) {
    return <p className="text-sm text-muted-foreground">No further status changes are available.</p>;
  }

  return (
    <div className="space-y-3">
      {next.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="status-note">Optional note</Label>
          <textarea
            id="status-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={200}
            className="min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base"
            placeholder="Shown in the order history"
          />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {next.map((item) => (
          <Button
            key={item}
            type="button"
            variant={destructive.includes(item) ? "destructive" : "default"}
            className={destructive.includes(item) ? "h-12" : "h-12 bg-forest"}
            disabled={Boolean(pending)}
            onClick={() => void onStatus(item)}
          >
            {pending === item ? "Updating…" : orderStatusActionLabel(item)}
          </Button>
        ))}
        {canCollect ? (
          <Button
            type="button"
            variant="outline"
            className="h-12"
            disabled={Boolean(pending)}
            onClick={() => void onCollect()}
          >
            {pending === "collect" ? "Saving…" : "Mark cash collected"}
          </Button>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(confirmStatus)}
        title={
          confirmStatus
            ? `Are you sure you want to ${orderStatusActionLabel(confirmStatus).toLowerCase()} this order?`
            : "Update order?"
        }
        description="This cannot be undone from here. Stock will be restored."
        confirmLabel={confirmStatus ? orderStatusActionLabel(confirmStatus) : "Confirm"}
        destructive
        pending={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmStatus(undefined);
          }
        }}
        onConfirm={() => {
          if (confirmStatus) {
            void applyStatus(confirmStatus);
          }
        }}
      />
    </div>
  );
}
