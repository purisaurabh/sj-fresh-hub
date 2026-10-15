import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "cn";
import { NotificationsRealtime } from "@/components/notifications/NotificationsRealtime";
import { UnreadBadge } from "@/components/notifications/UnreadBadge";

export function NotificationBell({
  href,
  unreadCount,
  userId,
  className,
}: {
  href: string;
  unreadCount: number;
  userId?: string;
  className?: string;
}) {
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <>
      {userId ? <NotificationsRealtime userId={userId} /> : null}
      <Link
        href={href}
        className={cn(
          "relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-forest hover:bg-mint",
          className,
        )}
        aria-label={label}
      >
        <Bell className="size-5" />
        {userId ? (
          <UnreadBadge
            userId={userId}
            initialCount={unreadCount}
            className="absolute right-1 top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white"
          />
        ) : null}
      </Link>
    </>
  );
}
