"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cancelOwnOrder } from "@/features/orders/actions";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setOpen(false);
    setPending(true);
    const result = await withActionOverlay(() => cancelOwnOrder(orderId));
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Order cancelled.");
  }

  return (
    <>
      <Button type="button" variant="outline" className="h-12" disabled={pending} onClick={() => setOpen(true)}>
        Cancel order
      </Button>
      <ConfirmDialog
        open={open}
        title="Cancel this order?"
        description="This cannot be undone. Items will go back into stock."
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        pending={pending}
        onOpenChange={setOpen}
        onConfirm={() => void onConfirm()}
      />
    </>
  );
}
