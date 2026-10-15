import {
  Ban,
  CheckCircle2,
  ChefHat,
  Clock3,
  PackageCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { OrderStatus } from "@/lib/constants";

export const PROGRESS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "placed", label: "Placed" },
  { status: "accepted", label: "Accepted" },
  { status: "preparing", label: "Packing" },
  { status: "out_for_delivery", label: "On the way" },
  { status: "delivered", label: "Delivered" },
];

export const STATUS_ICON: Record<OrderStatus, LucideIcon> = {
  placed: Clock3,
  accepted: CheckCircle2,
  preparing: ChefHat,
  out_for_delivery: Truck,
  delivered: PackageCheck,
  rejected: Ban,
  cancelled: Ban,
};

export const STATUS_HINT: Record<OrderStatus, string> = {
  placed: "Waiting for the shop to accept your order",
  accepted: "The shop has accepted your order",
  preparing: "Your items are being packed",
  out_for_delivery: "Your order is on the way",
  delivered: "Delivered. Enjoy your fresh produce!",
  rejected: "The shop could not take this order",
  cancelled: "This order was cancelled",
};

export function isClosedStatus(status: OrderStatus) {
  return status === "rejected" || status === "cancelled";
}

export function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(Number(quantity.toFixed(2)));
}
