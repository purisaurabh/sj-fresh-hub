import { isWebPushConfigured } from "@/lib/push/keys";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  return Response.json({
    publicKey,
    configured: isWebPushConfigured(publicKey),
  });
}
