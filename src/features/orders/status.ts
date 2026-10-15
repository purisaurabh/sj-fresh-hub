import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";

export const ADMIN_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  rejected: [],
  cancelled: [],
};

export function isOrderStatus(value: string): value is OrderStatus {
  return ORDER_STATUSES.includes(value as OrderStatus);
}

export function canAdminTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ADMIN_STATUS_TRANSITIONS[from].includes(to);
}

export function canCustomerCancel(status: OrderStatus): boolean {
  return status === "placed";
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "placed":
      return "bg-amber-100 text-amber-900";
    case "accepted":
      return "bg-mint text-forest";
    case "preparing":
      return "bg-sky-100 text-sky-900";
    case "out_for_delivery":
      return "bg-orange-100 text-orange-900";
    case "delivered":
      return "bg-emerald-100 text-emerald-900";
    case "rejected":
    case "cancelled":
      return "bg-red-50 text-destructive";
  }
}

export function orderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "placed":
      return "Placed";
    case "accepted":
      return "Accepted";
    case "preparing":
      return "Preparing";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Delivered";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
  }
}

export function orderStatusActionLabel(status: OrderStatus): string {
  switch (status) {
    case "placed":
      return "Place";
    case "accepted":
      return "Accept";
    case "preparing":
      return "Prepare";
    case "out_for_delivery":
      return "Out for delivery";
    case "delivered":
      return "Mark delivered";
    case "rejected":
      return "Reject";
    case "cancelled":
      return "Cancel";
  }
}
