import {
  Ban,
  Bell,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { AppNotification } from "@/features/notifications/queries";

export type NotificationTone = { icon: LucideIcon; className: string };

export function notificationTone(item: Pick<AppNotification, "title" | "message">): NotificationTone {
  const text = `${item.title} ${item.message}`.toLowerCase();
  if (text.includes("cancel") || text.includes("reject")) {
    return { icon: Ban, className: "bg-red-50 text-destructive" };
  }
  if (text.includes("delivered")) {
    return { icon: PackageCheck, className: "bg-emerald-100 text-emerald-800" };
  }
  if (text.includes("out for delivery") || text.includes("on the way")) {
    return { icon: Truck, className: "bg-orange-100 text-orange-800" };
  }
  if (text.includes("prepar") || text.includes("pack")) {
    return { icon: ChefHat, className: "bg-sky-100 text-sky-800" };
  }
  if (text.includes("accepted")) {
    return { icon: CheckCircle2, className: "bg-mint text-forest" };
  }
  if (text.includes("new order") || text.includes("placed")) {
    return { icon: ShoppingBag, className: "bg-sunshine/30 text-amber-900" };
  }
  return { icon: Bell, className: "bg-mint text-forest" };
}

export function relativeShort(iso: string) {
  const delta = Math.max(0, Date.now() - Date.parse(iso));
  const minutes = Math.floor(delta / 60_000);
  if (minutes < 1) {
    return "now";
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 48) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `${weeks}w`;
  }
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(Date.parse(iso));
}
