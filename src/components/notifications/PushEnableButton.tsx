"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePushSubscription } from "@/features/notifications/push-actions";
import {
  canUseBrowserPush,
  ensurePushSubscription,
  vapidPublicKey,
} from "@/components/notifications/browser-push";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type PushState = "loading" | "unsupported" | "off" | "on" | "blocked";

export function PushEnableButton() {
  const [state, setState] = useState<PushState>("loading");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!canUseBrowserPush() || !vapidPublicKey()) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }
    if (Notification.permission === "granted") {
      void ensurePushSubscription().then((subscription) => {
        setState(subscription ? "on" : "off");
      });
      return;
    }
    setState("off");
  }, []);

  async function onEnable() {
    setPending(true);
    try {
      await withActionOverlay(async () => {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "blocked" : "off");
          return;
        }
        const subscription = await ensurePushSubscription();
        if (!subscription) {
          toast.error("Could not turn on browser alerts.");
          setState("off");
          return;
        }
        setState("on");
        toast.success("Browser alerts are on for this device.");
      });
    } finally {
      setPending(false);
    }
  }

  async function onDisable() {
    setPending(true);
    try {
      await withActionOverlay(async () => {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await deletePushSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setState("off");
        toast.success("Browser alerts are off for this device.");
      });
    } finally {
      setPending(false);
    }
  }

  if (state === "loading" || state === "unsupported") {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="font-medium">Browser notification bar</p>
      {state === "blocked" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Alerts are blocked in this browser. Allow notifications for this site in browser settings, then refresh.
        </p>
      ) : state === "on" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          This device will show order alerts even if the tab is in the background.
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Allow notifications once so new orders and status changes appear in your browser or system notification bar.
        </p>
      )}
      {state === "off" ? (
        <Button className="mt-3 h-11 bg-forest" disabled={pending} type="button" onClick={() => void onEnable()}>
          {pending ? "Turning on…" : "Enable browser alerts"}
        </Button>
      ) : null}
      {state === "on" ? (
        <Button className="mt-3 h-11" variant="outline" disabled={pending} type="button" onClick={() => void onDisable()}>
          {pending ? "Updating…" : "Turn off on this device"}
        </Button>
      ) : null}
    </div>
  );
}
