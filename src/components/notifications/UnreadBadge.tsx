"use client";

import { useEffect } from "react";
import { useUnreadNotifications } from "@/features/notifications/unread-store";

const DEFAULT_CLASS_NAME =
  "inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white";

export function UnreadBadge({
  userId,
  initialCount,
  className = DEFAULT_CLASS_NAME,
}: {
  userId: string;
  initialCount: number;
  className?: string;
}) {
  const hydrate = useUnreadNotifications((state) => state.hydrate);
  const count = useUnreadNotifications((state) => state.count);
  const storeUserId = useUnreadNotifications((state) => state.userId);

  useEffect(() => {
    hydrate(userId, initialCount);
  }, [hydrate, initialCount, userId]);

  const display = storeUserId === userId ? count : initialCount;
  if (display <= 0) {
    return null;
  }

  return <span className={className}>{display > 9 ? "9+" : display}</span>;
}
