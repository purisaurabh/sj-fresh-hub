import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, CalendarDays, PackageX, ShoppingBag } from "lucide-react";
import { AdminOrderCard } from "@/components/admin/AdminOrderCard";
import { AdminOrdersFilters } from "@/components/admin/AdminOrdersFilters";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import { AdminOrdersSkeleton } from "@/components/orders/OrdersListSkeleton";
import { ordersFilterHref, parseAdminOrdersFilter } from "@/features/admin/orders-filter";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { getAdminBuildings, getAdminOrders, getAdminOverviewCounts } from "@/features/admin/queries";
import { todayInShopTz } from "@/lib/datetime";

export const metadata = { title: "Orders" };

type OrdersPageProps = {
  searchParams: Promise<{
    status?: string;
    building?: string;
    from?: string;
    to?: string;
    q?: string;
    page?: string;
  }>;
};

async function OrdersContent({ searchParams }: OrdersPageProps) {
  await connection();
  const params = await searchParams;
  const filter = parseAdminOrdersFilter(params);
  const page = filter.page ?? 1;
  const [{ orders, total, pageSize }, counts, buildings] = await Promise.all([
    getAdminOrders({ ...filter, page }),
    getAdminOverviewCounts(),
    getAdminBuildings(),
  ]);
  const today = todayInShopTz();
  const overview = [
    {
      href: ordersFilterHref({ ...filter, status: "placed", page: undefined }),
      label: "New orders",
      hint: "Waiting for you",
      value: counts.placedCount,
      icon: ShoppingBag,
      tone: "bg-mint text-forest",
      active: filter.status === "placed",
    },
    {
      href: ordersFilterHref({ ...filter, from: today, to: today, page: undefined }),
      label: "Today's orders",
      hint: "Placed today",
      value: counts.todayCount,
      icon: CalendarDays,
      tone: "bg-sky-100 text-sky-800",
      active: filter.from === today && filter.to === today,
    },
    {
      href: "/admin/products",
      label: "Low stock",
      hint: "Needs a restock",
      value: counts.lowStockCount,
      icon: AlertTriangle,
      tone: "bg-amber-100 text-amber-900",
      active: false,
    },
    {
      href: "/admin/products",
      label: "Out of stock",
      hint: "Sold out items",
      value: counts.outOfStockCount,
      icon: PackageX,
      tone: "bg-red-50 text-destructive",
      active: false,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader title="Orders" description="Filter by status, building or date, then open an order." />
      <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {overview.map((card) => {
          const Icon = card.icon;
          return (
            <li key={card.label}>
              <Link
                href={card.href}
                data-local-navigation={card.href.startsWith("/admin/orders") ? "" : undefined}
                className={`flex items-start gap-2 rounded-xl border bg-white p-2.5 shadow-sm transition-all hover:border-forest/40 sm:p-3 ${
                  card.active ? "border-forest ring-2 ring-forest/15" : "border-border"
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9 ${card.tone}`}>
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] leading-tight text-muted-foreground sm:text-xs">{card.label}</span>
                  <span className="mt-0.5 block text-xl font-semibold leading-none text-gray-900 sm:text-2xl">{card.value}</span>
                  <span className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">{card.hint}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <AdminOrdersFilters filter={filter} buildings={buildings.map((building) => ({ id: building.id, name: building.name }))}>
        {total === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p className="font-semibold text-gray-900">No orders in this view</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another filter, or wait for a new checkout.</p>
          </div>
        ) : (
          <OrdersPagedList
            page={page}
            total={total}
            pageSize={pageSize}
            prevHref={page > 1 ? ordersFilterHref({ ...filter, page: page - 1 }) : null}
            nextHref={page * pageSize < total ? ordersFilterHref({ ...filter, page: page + 1 }) : null}
            skeleton={<AdminOrdersSkeleton count={pageSize} />}
          >
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
                <p className="font-semibold text-gray-900">No orders on this page</p>
                <p className="mt-1 text-sm text-muted-foreground">Try the previous page to see more orders.</p>
              </div>
            ) : (
              <ul className="grid gap-2 lg:grid-cols-2">
                {orders.map((order) => (
                  <li key={order.id}>
                    <AdminOrderCard order={order} />
                  </li>
                ))}
              </ul>
            )}
          </OrdersPagedList>
        )}
      </AdminOrdersFilters>
    </div>
  );
}

export default function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <Suspense fallback={<BrandLoader />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
