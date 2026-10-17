import { Bell, Building2, ClipboardList, Package, Tags, Users } from "lucide-react";

export const ADMIN_NAV_LINKS = [
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/buildings", label: "Buildings", icon: Building2 },
  { href: "/admin/notifications", label: "Alerts", icon: Bell },
] as const;

export function isAdminNavActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
