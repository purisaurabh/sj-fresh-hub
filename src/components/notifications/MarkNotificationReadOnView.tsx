"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { markNotificationRead } from "@/features/notifications/actions";
import { useUnreadNotifications } from "@/features/notifications/unread-store";

function MarkNotificationReadOnViewInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const notificationId = searchParams.get("n");

  useEffect(() => {
    if (!notificationId) {
      return;
    }

    useUnreadNotifications.getState().markRead(notificationId);
    void markNotificationRead(notificationId);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("n");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [notificationId, pathname, router, searchParams]);

  return null;
}

export function MarkNotificationReadOnView() {
  return (
    <Suspense fallback={null}>
      <MarkNotificationReadOnViewInner />
    </Suspense>
  );
}
