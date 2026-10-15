"use client";

import { useEffect } from "react";
import { ensurePushSubscription } from "@/components/notifications/browser-push";

export function SyncPushSubscription() {
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    let cancelled = false;
    const delays = [0, 1500, 4000];

    delays.forEach((delay) => {
      window.setTimeout(() => {
        if (!cancelled) {
          void ensurePushSubscription();
        }
      }, delay);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
