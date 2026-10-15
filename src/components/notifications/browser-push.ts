import { savePushSubscription } from "@/features/notifications/push-actions";
import { isWebPushConfigured, urlBase64ToUint8Array } from "@/lib/push/keys";

let cachedPublicKey: string | undefined;

export function canUseBrowserPush(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getVapidPublicKey(): Promise<string | undefined> {
  const fromEnv = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (isWebPushConfigured(fromEnv)) {
    return fromEnv;
  }
  if (cachedPublicKey) {
    return cachedPublicKey;
  }
  try {
    const response = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
    const data = (await response.json()) as { publicKey?: string };
    if (isWebPushConfigured(data.publicKey)) {
      cachedPublicKey = data.publicKey;
      return cachedPublicKey;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function ensurePushSubscription(): Promise<PushSubscription | null> {
  const publicKey = await getVapidPublicKey();
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
  const result = await savePushSubscription({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
  if (!result.ok) {
    return null;
  }
  return subscription;
}
