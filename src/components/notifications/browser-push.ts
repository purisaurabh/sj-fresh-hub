import { savePushSubscription } from "@/features/notifications/push-actions";
import { isWebPushConfigured, urlBase64ToUint8Array } from "@/lib/push/keys";

export function vapidPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
}

export function canUseBrowserPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    isWebPushConfigured(vapidPublicKey())
  );
}

export async function ensurePushSubscription(): Promise<PushSubscription | null> {
  const publicKey = vapidPublicKey();
  if (!canUseBrowserPush() || !publicKey || Notification.permission !== "granted") {
    return null;
  }

  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    return null;
  }
  await savePushSubscription({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
  return subscription;
}
