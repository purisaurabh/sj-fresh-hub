"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PromptDialog } from "@/components/shop/PromptDialog";
import { canUseBrowserPush, ensurePushSubscription } from "@/components/notifications/browser-push";
import { SyncPushSubscription } from "@/components/notifications/SyncPushSubscription";
import { withActionOverlay } from "@/lib/ui/action-overlay";
import { shouldShowPushPrompt, type BrowserNotificationPermission } from "@/lib/ui/shop-hours";

function currentPushPermission(): BrowserNotificationPermission {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }
  return Notification.permission;
}

export function LoggedInPushPrompt() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const permission = currentPushPermission();
    if (permission === "granted") {
      return;
    }
    if (shouldShowPushPrompt(permission, true)) {
      setOpen(true);
    }
  }, []);

  async function onAllow() {
    setPending(true);
    try {
      await withActionOverlay(async () => {
        if (!canUseBrowserPush()) {
          setOpen(false);
          toast.error("This browser cannot enable alerts. Use Chrome or Edge on HTTPS.");
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const subscription = await ensurePushSubscription();
          setOpen(false);
          if (subscription) {
            toast.success("Browser alerts are on for this device.");
          } else {
            toast.error("Permission was granted, but this device could not be registered. Try again from Notifications.");
          }
          return;
        }
        if (permission === "denied") {
          toast.error("Notifications are blocked. Allow them in browser settings, then refresh.");
        }
        setOpen(false);
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <SyncPushSubscription />
      {open ? (
        <PromptDialog
          title="Turn on notifications"
          footer={
            <>
              <Button
                type="button"
                className="h-11 w-full bg-forest text-white hover:bg-forest/90"
                disabled={pending}
                onClick={() => void onAllow()}
              >
                {pending ? "Asking…" : "Allow notifications"}
              </Button>
              <Button type="button" variant="outline" className="h-11 w-full" disabled={pending} onClick={() => setOpen(false)}>
                Later
              </Button>
            </>
          }
        >
          <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-mint text-forest">
            <Bell className="size-5" aria-hidden="true" />
          </div>
          <p className="text-sm leading-relaxed text-gray-600">
            Allow alerts so order updates appear even if this website is closed.
          </p>
        </PromptDialog>
      ) : null}
    </>
  );
}
