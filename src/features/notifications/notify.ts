import type { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendWebPushForOrder } from "@/features/notifications/push-send";

type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function notifyAfterCommit(
  supabase: ServerSupabase,
  rpc: "notify_new_order" | "notify_order_status_change",
  orderId: string,
): Promise<void> {
  const { error } = await supabase.rpc(rpc, { p_order_id: orderId });
  if (error) {
    return;
  }

  try {
    await sendWebPushForOrder(orderId);
  } catch {
    // Browser push failure must not roll back a committed order.
  }
}
