import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Home, ShoppingBag } from "lucide-react";
import { CartLink } from "@/components/layout/CartLink";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/notifications", label: "Alerts", icon: Bell, badge: true },
] as const;

function isShopNavActive(href: string, pathname: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNavChrome({
  unreadBadge,
  showAlerts = true,
  pathname = "",
}: {
  unreadBadge?: ReactNode;
  showAlerts?: boolean;
  pathname?: string;
}) {
  const cartActive = pathname === "/cart" || pathname.startsWith("/checkout");
  const items = showAlerts ? ITEMS : ITEMS.filter((item) => item.href !== "/notifications");

  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <ul
        className={`grid gap-1 rounded-2xl border border-forest/10 bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(15,61,46,0.16)] ring-1 ring-black/5 backdrop-blur-md ${
          showAlerts ? "grid-cols-4" : "grid-cols-3"
        }`}
      >
        {items.map((item) => {
          const active = isShopNavActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-semibold transition-colors ${
                  active ? "bg-mint text-forest" : "text-gray-500 hover:bg-mint/50 hover:text-forest"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon className={`size-5 ${active ? "text-forest" : "text-gray-500"}`} aria-hidden="true" />
                  {"badge" in item ? (
                    <span className="absolute -top-1.5 -right-2.5">{unreadBadge}</span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <CartLink variant="tab" active={cartActive} />
        </li>
      </ul>
    </nav>
  );
}
