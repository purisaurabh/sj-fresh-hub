import { cache } from "react";
import { connection } from "next/server";
import { getAuthContext } from "@/features/auth/session";

export type AppNotification = {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export const getMyNotifications = cache(async (): Promise<AppNotification[]> => {
  await connection();
  const { supabase, user } = await getAuthContext();
  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("notifications")
    .select("id, order_id, type, title, message, is_read, created_at")
    .eq("recipient_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
});

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
