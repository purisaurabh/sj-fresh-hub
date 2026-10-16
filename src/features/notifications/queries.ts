import { cache } from "react";
import { connection } from "next/server";
import { getAuthContext } from "@/features/auth/session";
import { NOTIFICATIONS_PAGE_SIZE } from "@/lib/constants";

export type AppNotification = {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationPage = {
  notifications: AppNotification[];
  hasMore: boolean;
};

const NOTIFICATION_COLUMNS = "id, order_id, type, title, message, is_read, created_at";

export async function getMyNotificationsPage(offset = 0): Promise<NotificationPage> {
  await connection();
  const { supabase, user } = await getAuthContext();
  if (!user) {
    return { notifications: [], hasMore: false };
  }

  const pageSize = NOTIFICATIONS_PAGE_SIZE;
  const from = Math.max(0, offset);
  const { data } = await supabase
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + pageSize - 1);
  const notifications = data ?? [];

  return { notifications, hasMore: notifications.length === pageSize };
}

export const getUnreadNotificationCount = cache(async (): Promise<number> => {
  await connection();
  const { supabase, user } = await getAuthContext();
  if (!user) {
    return 0;
  }

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_user_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
});
