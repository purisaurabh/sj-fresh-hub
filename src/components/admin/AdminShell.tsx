"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Store } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminNav } from "@/components/admin/AdminNav";
import { PageSlot } from "@/components/feedback/PageSlot";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useRouteTransition } from "@/lib/ui/route-transition";

type AdminChromeProps = {
  unreadBadge?: ReactNode;
  profileMenu?: ReactNode;
};

function useActiveHref(pathname: string) {
  const pendingHref = useRouteTransition((state) => state.pendingHref);
  return (pendingHref ?? pathname).split("?")[0] ?? pathname;
}

function AdminHeader({
  unreadBadge,
  profileMenu,
  pathname,
}: AdminChromeProps & { pathname: string }) {
  const activeHref = useActiveHref(pathname);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1250px] items-center gap-2 px-4 py-2 md:px-6">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-forest md:text-base">SJ Fresh Hub Admin</p>
        <Link
          href="/"
          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-sunshine px-3 text-xs font-semibold text-gray-900 shadow-sm hover:bg-sunshine/90 md:hidden"
        >
          <Store className="size-3.5" aria-hidden="true" />
          Shop
        </Link>
        <AdminNav unreadBadge={unreadBadge} activeHref={activeHref} />
        <div className="flex shrink-0 items-center">
          <NotificationDropdown role="admin">
            <button
              type="button"
              className="relative flex size-11 items-center justify-center rounded-full text-forest hover:bg-mint md:hidden"
              aria-label="Alerts"
            >
              <Bell className="size-5" aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5">{unreadBadge}</span>
            </button>
          </NotificationDropdown>
          {profileMenu}
        </div>
        <Link
          href="/"
          className="ml-1 hidden min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-sunshine px-3.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-sunshine/90 md:inline-flex"
        >
          <Store className="size-3.5" aria-hidden="true" />
          View shop
        </Link>
      </div>
    </header>
  );
}

function AdminHeaderWithPath(props: AdminChromeProps) {
  const pathname = usePathname();
  return <AdminHeader {...props} pathname={pathname} />;
}

function AdminMobileNavWithPath() {
  const pathname = usePathname();
  const activeHref = useActiveHref(pathname);
  return <AdminMobileNav activeHref={activeHref} />;
}

export function AdminShell({
  unreadBadge,
  profileMenu,
  children,
}: AdminChromeProps & { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Suspense fallback={<AdminHeader unreadBadge={unreadBadge} profileMenu={profileMenu} pathname="" />}>
        <AdminHeaderWithPath unreadBadge={unreadBadge} profileMenu={profileMenu} />
      </Suspense>
      <div className="mx-auto w-full max-w-[1250px] flex-1 px-4 py-6 pb-28 md:px-6 md:pb-6">
        <PageSlot>{children}</PageSlot>
      </div>
      <Suspense fallback={<AdminMobileNav activeHref="" />}>
        <AdminMobileNavWithPath />
      </Suspense>
    </div>
  );
}
