"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { ADMIN_NAV_LINKS, isAdminNavActive } from "@/components/admin/admin-nav-links";

export function AdminNav({
  unreadBadge,
  activeHref,
}: {
  unreadBadge?: ReactNode;
  activeHref: string;
}) {
  return (
    <nav className="hidden items-center gap-1 text-sm font-medium md:flex" aria-label="Admin">
      {ADMIN_NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`inline-flex min-h-11 shrink-0 items-center gap-1 px-3 ${
            isAdminNavActive(link.href, activeHref) ? "text-forest underline decoration-2 underline-offset-4" : ""
          }`}
        >
          {link.label === "Alerts" ? "Notifications" : link.label}
          {link.href === "/admin/notifications" ? <span className="ml-1">{unreadBadge}</span> : null}
        </Link>
      ))}
      <Link
        href="/"
        className="ml-1 inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-sunshine px-3.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-sunshine/90"
      >
        <Store className="size-3.5" aria-hidden="true" />
        View shop
      </Link>
    </nav>
  );
}
