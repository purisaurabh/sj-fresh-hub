"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { setProductStatus } from "@/features/admin/actions";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function ProductStatusButton({
  productId,
  status,
  className,
}: {
  productId: string;
  status: string;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const next = status === "active" ? "inactive" : "active";
  const deactivating = next === "inactive";

  async function onToggle() {
    setConfirmOpen(false);
    setPending(true);
    const result = await withActionOverlay(() => setProductStatus(productId, next));
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
  }

  return (
    <div className="min-w-0">
      <Button
        type="button"
        variant="outline"
        className={cn("h-10", className)}
        disabled={pending}
        onClick={() => (deactivating ? setConfirmOpen(true) : void onToggle())}
      >
        {pending ? "Updating…" : deactivating ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate this product?"
        description="Customers will not be able to add it to the cart until you activate it again."
        confirmLabel="Deactivate"
        destructive
        pending={pending}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void onToggle()}
      />
    </div>
  );
}
