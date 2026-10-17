"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { setCategoryStatus } from "@/features/admin/actions";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function CategoryStatusButton({
  categoryId,
  isActive,
  className,
}: {
  categoryId: string;
  isActive: boolean;
  className?: string;
}) {
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onToggle() {
    setConfirmOpen(false);
    setPending(true);
    const result = await withActionOverlay(() => setCategoryStatus(categoryId, !isActive));
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
        className={cn(
          "h-9 w-full cursor-pointer justify-center border-forest/30 px-3 text-sm font-medium text-forest",
          className,
        )}
        disabled={pending}
        onClick={() => (isActive ? setConfirmOpen(true) : void onToggle())}
      >
        {pending ? "Updating…" : isActive ? "Deactivate" : "Activate"}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate this category?"
        description="Customers will not see this category in the shop until you activate it again. Products stay on file."
        confirmLabel="Deactivate"
        destructive
        pending={pending}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void onToggle()}
      />
    </div>
  );
}
