"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { NOTIFICATION_POLL_MS, shouldPollNotifications } from "@/features/notifications/realtime";
import { shouldRefreshOnNotificationChange } from "@/features/notifications/read-state";
import { useUnreadNotifications } from "@/features/notifications/unread-store";

export function NotificationsRealtime({ userId }: { userId: string }) {
  const router = useRouter();
  const [channelStatus, setChannelStatus] = useState<string | null>(null);

  useEffect(() => {
    let client: ReturnType<typeof createBrowserSupabaseClient>;
    try {
      client = createBrowserSupabaseClient();
    } catch {
      setChannelStatus("CHANNEL_ERROR");
      return;
    }

    const channel = client
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            useUnreadNotifications.getState().bumpUnread();
          }
          if (payload.eventType === "UPDATE") {
            const row = payload.new as { id?: string; is_read?: boolean } | null;
            if (row?.is_read && row.id) {
              useUnreadNotifications.getState().markRead(row.id);
            }
            return;
          }
          if (shouldRefreshOnNotificationChange(payload.eventType)) {
            router.refresh();
          }
        },
      )
      .subscribe((status) => {
        setChannelStatus(status);
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [router, userId]);

  useEffect(() => {
    function refreshIfVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    function poll() {
      if (shouldPollNotifications(channelStatus, document.visibilityState === "visible")) {
        router.refresh();
      }
    }

    const interval = window.setInterval(poll, NOTIFICATION_POLL_MS);
    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [channelStatus, router]);

  return null;
}
