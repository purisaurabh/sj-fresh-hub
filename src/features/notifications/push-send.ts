import "server-only";

import webpush from "web-push";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { readVapidConfig } from "@/lib/push/env";
import { webPushClickUrl, webPushPayload } from "@/lib/push/payload";

export async function sendWebPushForOrder(orderId: string): Promise<void> {
  const vapid = readVapidConfig();
  if (!vapid) {
    return;
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  const admin = createAdminSupabaseClient();
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: alerts } = await admin
    .from("notifications")
    .select("recipient_user_id, title, message, type, order_id")
    .eq("order_id", orderId)
    .gte("created_at", since);

  if (!alerts?.length) {
    return;
  }

  const recipientIds = [...new Set(alerts.map((alert) => alert.recipient_user_id))];
  const { data: subscriptions } = await admin
    .from("push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", recipientIds);

  if (!subscriptions?.length) {
    return;
  }

  const byUser = new Map<string, typeof alerts>();
  for (const alert of alerts) {
    const list = byUser.get(alert.recipient_user_id) ?? [];
    list.push(alert);
    byUser.set(alert.recipient_user_id, list);
  }

  await Promise.all(
    subscriptions.map(async (subscription) => {
      const alert = byUser.get(subscription.user_id)?.[0];
      if (!alert) {
        return;
      }
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          webPushPayload({
            title: alert.title,
            body: alert.message,
            url: webPushClickUrl(alert.type, alert.order_id),
          }),
        );
      } catch (error) {
        const status = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", subscription.id);
        }
      }
    }),
  );
}
