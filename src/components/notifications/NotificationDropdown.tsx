"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { BellOff, ChevronRight } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { toast } from "sonner";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/features/notifications/actions";
import { notificationOrderHref } from "@/features/notifications/paths";
import type { AppNotification } from "@/features/notifications/queries";
import { withLocalReads } from "@/features/notifications/read-state";
import { useUnreadNotifications } from "@/features/notifications/unread-store";
import { notificationTone, relativeShort } from "@/components/notifications/notification-meta";

export function NotificationDropdown({
  role,
  children,
}: {
  role: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const notificationsRef = useRef<AppNotification[] | null>(null);
  const hasMoreRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const readIds = useUnreadNotifications((state) => state.readIds);
  const allRead = useUnreadNotifications((state) => state.allRead);
  const markRead = useUnreadNotifications((state) => state.markRead);
  const unmarkRead = useUnreadNotifications((state) => state.unmarkRead);
  const markAllRead = useUnreadNotifications((state) => state.markAllRead);
  const revertAll = useUnreadNotifications((state) => state.revertAll);
  const items = useMemo(
    () => withLocalReads(notifications ?? [], readIds, allRead),
    [allRead, notifications, readIds],
  );
  const unreadCount = items.filter((item) => !item.is_read).length;
  notificationsRef.current = notifications;
  hasMoreRef.current = hasMore;

  function loadFirstPage() {
    setLoading(true);
    setLoadingMore(false);
    setHasMore(false);
    setNotifications(null);
    void listMyNotifications(0)
      .then((page) => {
        setNotifications(page.notifications);
        setHasMore(page.hasMore);
      })
      .catch(() => {
        setNotifications([]);
        setHasMore(false);
        toast.error("Could not load notifications.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function loadMore() {
    const current = notificationsRef.current;
    if (!hasMoreRef.current || loading || loadingMoreRef.current || !current) {
      return;
    }
    loadingMoreRef.current = true;
    setLoadingMore(true);
    void listMyNotifications(current.length)
      .then((page) => {
        setNotifications((rows) => {
          const seen = new Set((rows ?? []).map((item) => item.id));
          return [...(rows ?? []), ...page.notifications.filter((item) => !seen.has(item.id))];
        });
        setHasMore(page.hasMore);
      })
      .catch(() => {
        toast.error("Could not load more alerts.");
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }

  useEffect(() => {
    if (!open || loading || !hasMore) {
      return;
    }
    const sentinel = sentinelRef.current;
    const root = scrollerRef.current;
    if (!sentinel || !root) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { root, rootMargin: "96px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length, loading, open]);

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

  function openItem(item: AppNotification) {
    if (!item.is_read) {
      onRead(item.id);
    }
    const href = notificationOrderHref(item.order_id, role);
    setOpen(false);
    if (href) {
      router.push(item.is_read ? href : `${href}?n=${item.id}`);
    }
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          loadFirstPage();
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>{children}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          side="bottom"
          sideOffset={8}
          collisionPadding={16}
          onCloseAutoFocus={(event) => event.preventDefault()}
          style={{ width: "min(384px, calc(100vw - 2rem))", height: "min(384px, calc(100dvh - 6rem))" }}
          className="z-50 box-border overflow-hidden rounded-xl border border-border bg-white p-0 shadow-[0_16px_40px_rgba(15,61,46,0.16)] outline-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        >
          <div className="flex h-full flex-col" data-local-navigation>
            <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
              <h2 className="text-base font-semibold text-gray-900">Alerts</h2>
              {unreadCount > 0 && !loading ? (
                <button
                  type="button"
                  className="text-sm font-medium text-forest hover:underline"
                  onClick={onReadAll}
                >
                  Mark all as read
                </button>
              ) : null}
            </div>
            <div
              ref={scrollerRef}
              className="min-h-0 flex-1 overflow-y-auto"
              aria-busy={loading || loadingMore || undefined}
              aria-live="polite"
            >
              {loading || notifications === null ? (
                <PanelLoader />
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <span className="flex size-12 items-center justify-center rounded-lg bg-mint text-forest">
                    <BellOff className="size-6" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-gray-900">No alerts yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {role === "admin"
                      ? "New orders will show up here as they come in."
                      : "Order updates will appear here."}
                  </p>
                </div>
              ) : (
                <ul>
                  {items.map((item) => {
                    const tone = notificationTone(item);
                    const Icon = tone.icon;
                    const href = notificationOrderHref(item.order_id, role);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`group flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
                            item.is_read
                              ? "bg-white hover:bg-mint"
                              : "bg-mint/45 hover:bg-mint"
                          }`}
                          onClick={() => openItem(item)}
                        >
                          <span
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone.className}`}
                            aria-hidden="true"
                          >
                            <Icon className="size-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span
                                className={`line-clamp-1 text-sm ${
                                  item.is_read ? "font-medium text-gray-800" : "font-semibold text-gray-900"
                                }`}
                              >
                                {item.title}
                              </span>
                              <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                                {relativeShort(item.created_at)}
                                {!item.is_read ? (
                                  <span className="size-1.5 rounded-full bg-forest" aria-label="Unread" />
                                ) : null}
                              </span>
                            </span>
                            {href ? (
                              <span className="mt-1 inline-flex items-center gap-0.5 text-xs font-semibold text-forest opacity-0 transition-opacity group-hover:opacity-100">
                                View order
                                <ChevronRight className="size-3.5" aria-hidden="true" />
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                  {hasMore ? (
                    <li>
                      <div ref={sentinelRef} className="flex h-10 items-center justify-center">
                        {loadingMore ? <RowLoader /> : null}
                      </div>
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

function PanelLoader() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3" role="status">
      <div className="relative size-12">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-mint border-t-forest border-r-leaf" />
        <span className="absolute inset-2 flex items-center justify-center rounded-full bg-forest text-[10px] font-bold tracking-wide text-white">
          SJ
        </span>
      </div>
      <p className="text-sm font-medium text-forest">Loading alerts</p>
    </div>
  );
}

function RowLoader() {
  return (
    <span className="relative block size-6" role="status" aria-label="Loading more alerts">
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-mint border-t-forest" />
    </span>
  );
}
