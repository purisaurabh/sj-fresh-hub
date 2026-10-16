"use server";

import { z } from "zod";
import { actionError, actionSuccess, type ActionResult } from "@/lib/action-result";
import { requireUser } from "@/features/auth/session";
import { getMyNotificationsPage, type NotificationPage } from "@/features/notifications/queries";

const notificationIdSchema = z.string().uuid();

export async function listMyNotifications(offset = 0): Promise<NotificationPage> {
  return getMyNotificationsPage(offset);
}

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) {
    return actionError("That notification could not be found.");
  }

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", parsed.data)
    .eq("recipient_user_id", user.id);

  if (error) {
    return actionError("Could not mark that notification as read.");
  }

  return actionSuccess();
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("recipient_user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return actionError("Could not update notifications.");
  }

  return actionSuccess();
}
