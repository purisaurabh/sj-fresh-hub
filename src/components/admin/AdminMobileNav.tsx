"use client";

import Link from "next/link";
import { ADMIN_NAV_LINKS, isAdminNavActive } from "@/components/admin/admin-nav-links";

const MOBILE_NAV_LINKS = ADMIN_NAV_LINKS.filter((link) => link.href !== "/admin/notifications");

export function AdminMobileNav({ activeHref }: { activeHref: string }) {
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Admin"
    >
      <ul className="grid grid-cols-5 gap-0.5 rounded-2xl border border-forest/10 bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(15,61,46,0.16)] ring-1 ring-black/5 backdrop-blur-md">
        {MOBILE_NAV_LINKS.map((link) => {
          const active = isAdminNavActive(link.href, activeHref);
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-center text-[10px] font-semibold leading-tight transition-colors sm:text-[11px] ${
                  active ? "bg-mint text-forest" : "text-gray-500 hover:bg-mint/50 hover:text-forest"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={`size-5 ${active ? "text-forest" : "text-gray-500"}`} aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
