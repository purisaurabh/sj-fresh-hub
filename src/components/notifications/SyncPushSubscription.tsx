"use client";

import { useEffect } from "react";
import { ensurePushSubscription } from "@/components/notifications/browser-push";

export function SyncPushSubscription() {
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }
    void ensurePushSubscription();
  }, []);

  return null;
}
