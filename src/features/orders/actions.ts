"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireCustomer } from "@/features/auth/session";
import { checkoutSchema } from "@/features/orders/schemas";
import { mapOrderError } from "@/features/orders/errors";
import { notifyAfterCommit } from "@/features/notifications/notify";

export async function placeOrder(input: unknown): Promise<ActionResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "Check the checkout form.");
  }

  const { supabase } = await requireCustomer();
  const { data, error } = await supabase.rpc("place_order", {
    p_address_id: parsed.data.addressId,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_customer_note: parsed.data.customerNote || undefined,
  });

  if (error || !data) {
    return actionError(mapOrderError(error?.message));
  }

  await notifyAfterCommit(supabase, "notify_new_order", data.id);

  revalidatePath("/orders");
  revalidatePath(`/orders/${data.id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/notifications");
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
  redirect(`/orders/${data.id}?new=1`);
}

export async function cancelOwnOrder(orderId: string): Promise<ActionResult> {
  const { supabase } = await requireCustomer();
  const { error } = await supabase.rpc("cancel_own_order", { p_order_id: orderId });
  if (error) {
    return actionError(mapOrderError(error.message));
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  return actionSuccess("Order cancelled.");
}
