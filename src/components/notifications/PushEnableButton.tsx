"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePushSubscription } from "@/features/notifications/push-actions";
import {
  canUseBrowserPush,
  ensurePushSubscription,
  getVapidPublicKey,
} from "@/components/notifications/browser-push";
import { withActionOverlay } from "@/lib/ui/action-overlay";

type PushState = "loading" | "unsupported" | "off" | "on" | "blocked";

export function PushEnableButton() {
  const [state, setState] = useState<PushState>("loading");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!canUseBrowserPush() || !(await getVapidPublicKey())) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("blocked");
        return;
      }
      if (Notification.permission === "granted") {
        const subscription = await ensurePushSubscription();
        setState(subscription ? "on" : "off");
        return;
      }
      setState("off");
    })();
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
          toast.error("Log in on this device, then tap Enable browser alerts again.");
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

  if (state === "loading") {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="font-medium">Browser notification bar</p>
      {state === "unsupported" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          This browser cannot show system alerts. Use Chrome or Edge on HTTPS, or install the site on iPhone from the share menu.
        </p>
      ) : state === "blocked" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          Alerts are blocked in this browser. Allow notifications for this site in browser settings, then refresh.
        </p>
      ) : state === "on" ? (
        <p className="mt-1 text-sm text-muted-foreground">
          This device will show order alerts even if the website is closed.
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Allow notifications once so new orders and status changes appear in your phone or laptop notification bar, even if the site is closed.
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
