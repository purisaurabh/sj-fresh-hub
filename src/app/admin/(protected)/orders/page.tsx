import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, CalendarDays, PackageX, ShoppingBag } from "lucide-react";
import { AdminOrderCard } from "@/components/admin/AdminOrderCard";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { OrdersPagination } from "@/components/orders/OrdersPagination";
import { OrdersStatusFilter } from "@/components/admin/OrdersStatusFilter";
import { ordersFilterHref } from "@/features/admin/orders-filter";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { getAdminOrders, getAdminOverviewCounts } from "@/features/admin/queries";
import { isOrderStatus } from "@/features/orders/status";
import { isIsoDateOnly, todayInShopTz } from "@/lib/datetime";

export const metadata = { title: "Orders" };

type OrdersPageProps = {
  searchParams: Promise<{ status?: string; from?: string; page?: string }>;
};

async function OrdersContent({ searchParams }: OrdersPageProps) {
  await connection();
  const params = await searchParams;
  const selected = params.status && isOrderStatus(params.status) ? params.status : undefined;
  const from = isIsoDateOnly(params.from) ? params.from : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const [{ orders, total, pageSize }, counts] = await Promise.all([
    getAdminOrders({ status: selected, from, page }),
    getAdminOverviewCounts(),
  ]);
  const today = todayInShopTz();
  const overview = [
    {
      href: ordersFilterHref("placed", from),
      label: "New orders",
      hint: "Waiting for you",
      value: counts.placedCount,
      icon: ShoppingBag,
      tone: "bg-mint text-forest",
      active: selected === "placed",
    },
    {
      href: ordersFilterHref(selected, today),
      label: "Today's orders",
      hint: "Placed today",
      value: counts.todayCount,
      icon: CalendarDays,
      tone: "bg-sky-100 text-sky-800",
      active: from === today,
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
      <AdminPageHeader title="Orders" description="Filter by status, then open an order to update it." />
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
      <OrdersStatusFilter selected={selected} from={from}>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
            <p className="font-semibold text-gray-900">No orders in this view</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another status, or wait for a new checkout.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ul className="grid gap-2 lg:grid-cols-2">
              {orders.map((order) => (
                <li key={order.id}>
                  <AdminOrderCard order={order} />
                </li>
              ))}
            </ul>
            <OrdersPagination
              page={page}
              total={total}
              pageSize={pageSize}
              hrefForPage={(nextPage) => ordersFilterHref(selected, from, nextPage)}
            />
          </div>
        )}
      </OrdersStatusFilter>
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
