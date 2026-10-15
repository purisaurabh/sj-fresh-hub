import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendWebPushForOrder } from "@/features/notifications/push-send";

type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

async function continueWebPush(orderId: string) {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil(sendWebPushForOrder(orderId));
  } catch {
    void sendWebPushForOrder(orderId);
  }
}

export async function notifyAfterCommit(
  supabase: ServerSupabase,
  rpc: "notify_new_order" | "notify_order_status_change",
  orderId: string,
): Promise<void> {
  try {
    await supabase.rpc(rpc, { p_order_id: orderId });
  } catch {
    // Notification failure must not roll back a committed order.
  }

  await continueWebPush(orderId);
}
