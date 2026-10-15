"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Ban,
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  ChefHat,
  ChevronRight,
  PackageCheck,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, markNotificationRead } from "@/features/notifications/actions";
import { withLocalReads } from "@/features/notifications/read-state";
import type { AppNotification } from "@/features/notifications/queries";
import { notificationOrderHref } from "@/features/notifications/paths";
import { useUnreadNotifications } from "@/features/notifications/unread-store";

const TIME_ZONE = "Asia/Kolkata";

type Tone = { icon: LucideIcon; className: string };

function toneFor(item: AppNotification): Tone {
  const text = `${item.title} ${item.message}`.toLowerCase();
  if (text.includes("cancel") || text.includes("reject")) {
    return { icon: Ban, className: "bg-red-50 text-destructive" };
  }
  if (text.includes("delivered")) {
    return { icon: PackageCheck, className: "bg-emerald-100 text-emerald-800" };
  }
  if (text.includes("out for delivery") || text.includes("on the way")) {
    return { icon: Truck, className: "bg-orange-100 text-orange-800" };
  }
  if (text.includes("prepar") || text.includes("pack")) {
    return { icon: ChefHat, className: "bg-sky-100 text-sky-800" };
  }
  if (text.includes("accepted")) {
    return { icon: CheckCircle2, className: "bg-mint text-forest" };
  }
  if (text.includes("new order") || text.includes("placed")) {
    return { icon: ShoppingBag, className: "bg-sunshine/30 text-amber-900" };
  }
  return { icon: Bell, className: "bg-mint text-forest" };
}

function dayKey(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(Date.parse(iso));
}

function dayLabel(key: string, todayKey: string, yesterdayKey: string) {
  if (key === todayKey) {
    return "Today";
  }
  if (key === yesterdayKey) {
    return "Yesterday";
  }
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: TIME_ZONE }).format(
    Date.parse(`${key}T12:00:00+05:30`),
  );
}

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { timeStyle: "short", timeZone: TIME_ZONE }).format(Date.parse(iso));
}

function groupByDay(notifications: AppNotification[]) {
  const now = Date.now();
  const todayKey = dayKey(new Date(now).toISOString());
  const yesterdayKey = dayKey(new Date(now - 24 * 60 * 60 * 1000).toISOString());
  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const item of notifications) {
    const label = dayLabel(dayKey(item.created_at), todayKey, yesterdayKey);
    const last = groups.at(-1);
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}

export function NotificationInbox({
  notifications,
  role,
}: {
  notifications: AppNotification[];
  role: string | null;
}) {
  const readIds = useUnreadNotifications((state) => state.readIds);
  const allRead = useUnreadNotifications((state) => state.allRead);
  const markRead = useUnreadNotifications((state) => state.markRead);
  const unmarkRead = useUnreadNotifications((state) => state.unmarkRead);
  const markAllRead = useUnreadNotifications((state) => state.markAllRead);
  const revertAll = useUnreadNotifications((state) => state.revertAll);
  const items = useMemo(
    () => withLocalReads(notifications, readIds, allRead),
    [allRead, notifications, readIds],
  );
  const unreadCount = items.filter((item) => !item.is_read).length;

  function onRead(id: string) {
    markRead(id);
    void markNotificationRead(id).then((result) => {
      if (!result.ok) {
        unmarkRead(id);
        toast.error(result.error);
      }
    });
  }

  function onReadAll() {
    const unreadIds = items.filter((item) => !item.is_read).map((item) => item.id);
    markAllRead(unreadIds);
    void markAllNotificationsRead().then((result) => {
      if (!result.ok) {
        revertAll(unreadIds.length);
        toast.error(result.error);
      }
    });
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-mint text-forest">
          <BellOff className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">No notifications yet</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {role === "admin"
            ? "New orders and updates will appear here as soon as they come in."
            : "We'll let you know here when your order is accepted, packed, on the way and delivered."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
        <p className="flex items-center gap-2 text-sm text-gray-700">
          <span
            className={`flex size-8 items-center justify-center rounded-full ${
              unreadCount > 0 ? "bg-forest text-white" : "bg-mint text-forest"
            }`}
          >
            <Bell className="size-4" aria-hidden="true" />
          </span>
          {unreadCount > 0 ? (
            <span>
              <span className="font-semibold text-gray-900">{unreadCount} unread</span> of {notifications.length}
            </span>
          ) : (
            <span>You&apos;re all caught up</span>
          )}
        </p>
        {unreadCount > 0 ? (
          <Button type="button" variant="ghost" className="h-10 text-forest hover:bg-mint" onClick={onReadAll}>
            <CheckCheck className="size-4" aria-hidden="true" />
            Mark all as read
          </Button>
        ) : null}
      </div>

      {groupByDay(items).map((group) => (
        <section key={group.label} className="flex flex-col gap-2" aria-label={group.label}>
          <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</h2>
          <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            {group.items.map((item) => {
              const href = notificationOrderHref(item.order_id, role);
              const tone = toneFor(item);
              const Icon = tone.icon;
              return (
                <li
                  key={item.id}
                  className={`relative flex gap-3 border-b border-border p-4 last:border-b-0 sm:gap-4 ${
                    item.is_read ? "bg-white" : "bg-mint/35"
                  }`}
                >
                  {!item.is_read ? (
                    <span className="absolute inset-y-0 left-0 w-1 bg-forest" aria-hidden="true" />
                  ) : null}
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tone.className}`}
                    aria-hidden="true"
                  >
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm ${item.is_read ? "font-medium text-gray-800" : "font-semibold text-gray-900"}`}>
                        {item.title}
                      </p>
                      <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        {timeLabel(item.created_at)}
                        {!item.is_read ? (
                          <span className="size-2 rounded-full bg-forest" aria-label="Unread" />
                        ) : null}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      {href ? (
                        <Link
                          href={item.is_read ? href : `${href}?n=${item.id}`}
                          className="inline-flex min-h-9 items-center gap-0.5 text-sm font-semibold text-forest hover:underline"
                          onPointerDown={() => {
                            if (!item.is_read) {
                              markRead(item.id);
                            }
                          }}
                        >
                          View order
                          <ChevronRight className="size-4" aria-hidden="true" />
                        </Link>
                      ) : null}
                      {!item.is_read ? (
                        <button
                          type="button"
                          className="inline-flex min-h-9 items-center text-sm font-medium text-muted-foreground hover:text-forest"
                          onClick={() => onRead(item.id)}
                        >
                          Mark as read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
