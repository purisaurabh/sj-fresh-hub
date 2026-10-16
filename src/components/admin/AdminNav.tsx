"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { ADMIN_NAV_LINKS, isAdminNavActive } from "@/components/admin/admin-nav-links";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

export function AdminNav({
  unreadBadge,
  activeHref,
}: {
  unreadBadge?: ReactNode;
  activeHref: string;
}) {
  return (
    <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Admin">
      {ADMIN_NAV_LINKS.filter((link) => link.href !== "/admin/notifications").map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`inline-flex min-h-11 shrink-0 items-center gap-1 px-3 ${
            isAdminNavActive(link.href, activeHref) ? "text-forest underline decoration-2 underline-offset-4" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
      <NotificationDropdown role="admin">
        <button
          type="button"
          className="relative flex min-h-11 min-w-11 items-center justify-center rounded-lg text-forest hover:bg-mint"
          aria-label="Alerts"
        >
          <Bell className="size-5" />
          <span className="absolute top-1 right-1">{unreadBadge}</span>
        </button>
      </NotificationDropdown>
    </nav>
  );
}
