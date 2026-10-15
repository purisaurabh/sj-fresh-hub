"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { logoutUser } from "@/features/auth/actions";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useUnreadNotifications } from "@/features/notifications/unread-store";
import { withActionOverlay } from "@/lib/ui/action-overlay";

export function LogoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function onConfirm() {
    setOpen(false);
    const result = await withActionOverlay(() => logoutUser());
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Logged out successfully");
    useUnreadNotifications.getState().reset();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 border-destructive/30 text-destructive hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        Log out
      </Button>
      <ConfirmDialog
        open={open}
        title="Are you sure you want to log out?"
        confirmLabel="Log out"
        onOpenChange={setOpen}
        onConfirm={() => void onConfirm()}
      />
    </>
  );
}
