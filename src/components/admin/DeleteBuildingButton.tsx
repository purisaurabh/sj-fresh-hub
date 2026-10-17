"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import { deleteBuilding } from "@/features/admin/actions";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function DeleteBuildingButton({
  buildingId,
  buildingName,
  linkedCount,
  className,
}: {
  buildingId: string;
  buildingName: string;
  linkedCount: number;
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const blocked = linkedCount > 0;

  async function onConfirm() {
    setConfirmOpen(false);
    setPending(true);
    const result = await withActionOverlay(() => deleteBuilding(buildingId));
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
          "h-9 w-full cursor-pointer justify-center border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-red-50",
          className,
        )}
        disabled={pending}
        onClick={() => {
          if (blocked) {
            toast.error("Customers still use this building. Deactivate it instead.");
            return;
          }
          setConfirmOpen(true);
        }}
      >
        {pending ? "Deleting…" : "Delete"}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title={`Delete ${buildingName}?`}
        description="It will disappear from registration and checkout. Past orders stay on file."
        confirmLabel="Delete building"
        destructive
        pending={pending}
        onOpenChange={setConfirmOpen}
        onConfirm={() => void onConfirm()}
      />
    </div>
  );
}
