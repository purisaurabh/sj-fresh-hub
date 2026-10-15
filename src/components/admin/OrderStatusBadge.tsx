"use client";

import { Badge } from "@/components/ui/badge";
import { isOrderStatus, orderStatusBadgeClass, orderStatusLabel } from "@/features/orders/status";

export function OrderStatusBadge({ status }: { status: string }) {
  if (!isOrderStatus(status)) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return <Badge className={orderStatusBadgeClass(status)}>{orderStatusLabel(status)}</Badge>;
}
