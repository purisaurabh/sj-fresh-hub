"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { deleteProduct } from "@/features/admin/actions";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function DeleteProductButton({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onConfirm() {
    setConfirmOpen(false);
    setPending(true);
    const result = await withActionOverlay(() => deleteProduct(productId));
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
    router.refresh();
  }

  return (
    <div className="min-w-0">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-9 w-full justify-center border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50",
          className,
        )}
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${productName}?`}
        description="It will disappear from the shop. Past orders keep the name and price."
        confirmLabel="Delete product"
        destructive
        pending={pending}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}
