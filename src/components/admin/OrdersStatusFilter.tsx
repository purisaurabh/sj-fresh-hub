"use client";

import { useOptimistic, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { ordersFilterHref } from "@/features/admin/orders-filter";
import { orderStatusLabel } from "@/features/orders/status";
import { ORDER_STATUSES } from "@/lib/constants";
import { AdminOrdersSkeleton } from "@/components/orders/OrdersListSkeleton";

type OrdersStatusFilterProps = {
  selected?: string;
  from?: string;
  children: ReactNode;
};

export function OrdersStatusFilter({ selected, from, children }: OrdersStatusFilterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(selected ?? "");

  function go(status: string) {
    if (status === active) {
      return;
    }
    startTransition(() => {
      setActive(status);
      router.replace(ordersFilterHref(status || undefined, from), { scroll: false });
    });
  }

  function choose(event: React.MouseEvent<HTMLAnchorElement>, status: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    go(status);
  }

  const items = [
    { status: "", name: "All", href: ordersFilterHref(undefined, from) },
    ...ORDER_STATUSES.map((status) => ({
      status,
      name: orderStatusLabel(status),
      href: ordersFilterHref(status, from),
    })),
  ];

  return (
    <>
      <div className="md:hidden">
        <label htmlFor="order-status-filter" className="mb-1 block text-xs font-medium text-muted-foreground">
          Status
        </label>
        <div className="relative">
          <select
            id="order-status-filter"
            className="h-11 w-full appearance-none rounded-xl border border-border bg-white py-1 pr-10 pl-3 text-sm font-medium text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            value={active}
            onChange={(event) => go(event.target.value)}
          >
            {items.map((item) => (
              <option key={item.status || "all"} value={item.status}>
                {item.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>
      <nav className="hidden flex-wrap gap-1.5 md:flex" aria-label="Order status" data-local-navigation>
        {items.map((item) => (
          <Link
            key={item.status || "all"}
            href={item.href}
            scroll={false}
            onClick={(event) => choose(event, item.status)}
            aria-current={active === item.status ? "page" : undefined}
            className={`inline-flex min-h-8 items-center rounded-full px-2.5 text-xs font-medium ${
              active === item.status ? "bg-forest text-white" : "border border-border bg-white text-gray-700 hover:bg-mint"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
      {isPending ? <AdminOrdersSkeleton /> : children}
    </>
  );
}
