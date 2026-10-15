"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store } from "lucide-react";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AdminNav } from "@/components/admin/AdminNav";
import { PageSlot } from "@/components/feedback/PageSlot";
import { useRouteTransition } from "@/lib/ui/route-transition";

export function AdminShell({
  unreadBadge,
  profileMenu,
  children,
}: {
  unreadBadge?: ReactNode;
  profileMenu?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const pendingHref = useRouteTransition((state) => state.pendingHref);
  const activeHref = (pendingHref ?? pathname).split("?")[0] ?? pathname;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
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
          <div className="shrink-0">{profileMenu}</div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1250px] flex-1 px-4 py-6 pb-28 md:px-6 md:pb-6">
        <PageSlot>{children}</PageSlot>
      </div>
      <AdminMobileNav unreadBadge={unreadBadge} activeHref={activeHref} />
    </div>
  );
}
