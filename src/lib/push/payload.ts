import { getSiteUrl } from "@/lib/env";
import { notificationOrderHref } from "@/features/notifications/paths";

export function webPushPayload(input: { title: string; body: string; url: string }): string {
  return JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.url,
  });
}

export function webPushClickUrl(type: string, orderId: string | null): string {
  const site = getSiteUrl().replace(/\/$/, "");
  const role = type === "new_order" ? "admin" : "customer";
  const path = notificationOrderHref(orderId, role) ?? (role === "admin" ? "/admin/notifications" : "/notifications");
  return `${site}${path}`;
}
