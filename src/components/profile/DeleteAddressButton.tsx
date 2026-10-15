"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteAddress } from "@/features/addresses/actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function DeleteAddressButton({
  addressId,
  onDeleted,
}: {
  addressId: string;
  onDeleted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setOpen(false);
    setPending(true);
    const result = await withActionOverlay(() => deleteAddress(addressId));
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message);
    onDeleted?.();
  }

  return (
    <>
      <Button type="button" variant="ghost" className="h-11" disabled={pending} onClick={() => setOpen(true)}>
        Remove
      </Button>
      <ConfirmDialog
        open={open}
        title="Remove this address?"
        description="You can add it again later if you still need it for delivery."
        confirmLabel="Remove address"
        destructive
        pending={pending}
        onOpenChange={setOpen}
        onConfirm={() => void onConfirm()}
      />
    </>
  );
}
