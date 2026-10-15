"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromptDialog } from "@/components/shop/PromptDialog";
import { SHOP_HOURS_MESSAGE, SHOP_HOURS_TITLE } from "@/lib/constants";
import { acknowledgeShopHours, hasAcknowledgedShopHours } from "@/lib/ui/shop-hours";

export function FirstVisitPrompts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasAcknowledgedShopHours()) {
      setOpen(true);
    }
  }, []);

  if (!open) {
    return null;
  }

  return (
    <PromptDialog
      title={SHOP_HOURS_TITLE}
      footer={
        <Button
          type="button"
          className="h-11 w-full bg-forest text-white hover:bg-forest/90"
          onClick={() => {
            acknowledgeShopHours();
            setOpen(false);
          }}
        >
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
    </PromptDialog>
  );
}
