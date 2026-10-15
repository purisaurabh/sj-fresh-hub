"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bell, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { canUseBrowserPush, ensurePushSubscription } from "@/components/notifications/browser-push";
import { SHOP_HOURS_MESSAGE, SHOP_HOURS_TITLE } from "@/lib/constants";
import { withActionOverlay } from "@/lib/ui/action-overlay";
import {
  acknowledgePushPrompt,
  acknowledgeShopHours,
  hasAcknowledgedPushPrompt,
  hasAcknowledgedShopHours,
} from "@/lib/ui/shop-hours";

type Step = "hours" | "push";

function Shell({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-200 flex items-end justify-center bg-black/60 p-4 pt-[max(1.5rem,env(safe-area-inset-top))] sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-visit-title"
        className="mb-[max(1rem,env(safe-area-inset-bottom))] w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:mb-0"
      >
        <h2 id="first-visit-title" className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
        <div className="mt-4 flex flex-col gap-2">{footer}</div>
      </div>
    </div>
  );
}

export function FirstVisitPrompts() {
  const [step, setStep] = useState<Step | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!hasAcknowledgedShopHours()) {
      setStep("hours");
      return;
    }
    if (!hasAcknowledgedPushPrompt()) {
      setStep("push");
    }
  }, []);

  function finishHours() {
    acknowledgeShopHours();
    setStep("push");
  }

  function finishPush() {
    acknowledgePushPrompt();
    setStep(null);
  }

  async function onAllow() {
    setPending(true);
    try {
      await withActionOverlay(async () => {
        if (typeof window === "undefined" || !window.isSecureContext || !("Notification" in window)) {
          finishPush();
          toast.error(
            "This phone link is not HTTPS, so the browser cannot enable alerts yet. You will still get in-app alerts after login.",
          );
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission === "denied") {
          finishPush();
          toast.error("Notifications are blocked. You can enable them later in browser settings.");
          return;
        }
        if (permission === "granted" && canUseBrowserPush()) {
          const subscription = await ensurePushSubscription();
          finishPush();
          if (subscription) {
            toast.success("Browser alerts are on.");
          } else {
            toast.error("Permission was granted, but this device could not be registered.");
          }
          return;
        }
        finishPush();
      });
    } finally {
      setPending(false);
    }
  }

  if (step === "hours") {
    return (
      <Shell
        title={SHOP_HOURS_TITLE}
        footer={
          <Button type="button" className="h-11 w-full bg-forest text-white hover:bg-forest/90" onClick={finishHours}>
            Got it
          </Button>
        }
      >
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-mint text-forest">
          <Clock className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-gray-600">{SHOP_HOURS_MESSAGE}</p>
        <div className="mt-3 grid gap-2 rounded-xl bg-mint px-3 py-3 text-sm text-gray-800">
          <p>
            <span className="font-semibold text-forest">Orders:</span> 9:00 AM – 12:00 PM
          </p>
          <p>
            <span className="font-semibold text-forest">Delivery:</span> 3:00 PM – 6:00 PM only
          </p>
        </div>
      </Shell>
    );
  }

  if (step === "push") {
    return (
      <Shell
        title="Turn on notifications"
        footer={
          <>
            <Button type="button" className="h-11 w-full bg-forest text-white hover:bg-forest/90" disabled={pending} onClick={() => void onAllow()}>
              {pending ? "Asking…" : "Allow notifications"}
            </Button>
            <Button type="button" variant="outline" className="h-11 w-full" disabled={pending} onClick={finishPush}>
              Later
            </Button>
          </>
        }
      >
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-mint text-forest">
          <Bell className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm leading-relaxed text-gray-600">
          Allow alerts so order updates (accepted, out for delivery, delivered) appear even if this tab is in the background.
        </p>
      </Shell>
    );
  }

  return null;
}
