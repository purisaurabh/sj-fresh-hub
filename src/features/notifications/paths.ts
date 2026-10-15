export function notificationsPathForRole(role: string | null | undefined): string {
  return role === "admin" ? "/admin/notifications" : "/notifications";
}

export function notificationOrderHref(
  orderId: string | null | undefined,
  role: string | null | undefined,
): string | null {
  if (!orderId) {
    return null;
  }
  return role === "admin" ? `/admin/orders/${orderId}` : `/orders/${orderId}`;
}
