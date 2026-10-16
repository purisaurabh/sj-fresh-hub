import Link from "next/link";
import { Suspense } from "react";
import { PackageOpen, ShoppingBasket } from "lucide-react";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import { CustomerOrdersSkeleton } from "@/components/orders/OrdersListSkeleton";
import { BrandLoader } from "@/components/feedback/BrandLoader";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { requireCustomer } from "@/features/auth/session";
import { getMyOrdersPage, type CustomerOrder } from "@/features/orders/queries";

export const metadata = { title: "Your orders" };

type OrdersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

function ordersPageHref(page: number) {
  return page > 1 ? `/orders?page=${page}` : "/orders";
}

function OrderList({ orders }: { orders: CustomerOrder[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <li key={order.id}>
          <OrderCard order={order} />
        </li>
      ))}
    </ul>
  );
}

function NoOrders() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-mint text-forest">
        <PackageOpen className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-gray-900">No orders yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Fresh vegetables and fruits are just a few taps away. Your Cash on Delivery orders will show up here.
      </p>
      <Button asChild className="mt-6 h-11 bg-forest px-6 text-white hover:bg-forest/90">
        <Link href="/">Start shopping</Link>
      </Button>
    </div>
  );
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
  const { user } = await requireCustomer();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const { orders, total, pageSize } = await getMyOrdersPage(user.id, page);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 md:text-2xl">Your orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0
              ? `${total} ${total === 1 ? "order" : "orders"} · Track deliveries and view past purchases`
              : "Track deliveries and view past purchases"}
          </p>
        </div>
        {total > 0 ? (
          <Button asChild variant="outline" className="h-11 border-forest/30 text-forest hover:bg-mint">
            <Link href="/">
              <ShoppingBasket className="size-4" aria-hidden="true" />
              Shop more
            </Link>
          </Button>
        ) : null}
      </div>

      {total === 0 ? (
        <NoOrders />
      ) : (
        <OrdersPagedList
          page={page}
          total={total}
          pageSize={pageSize}
          prevHref={page > 1 ? ordersPageHref(page - 1) : null}
          nextHref={page * pageSize < total ? ordersPageHref(page + 1) : null}
          scroll
          skeleton={<CustomerOrdersSkeleton count={pageSize} />}
        >
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-10 text-center">
              <p className="font-semibold text-gray-900">No orders on this page</p>
              <p className="mt-1 text-sm text-muted-foreground">Try the previous page to see your recent orders.</p>
            </div>
          ) : (
            <OrderList orders={orders} />
          )}
        </OrdersPagedList>
      )}
    </div>
  );
}

export default function OrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <Suspense fallback={<BrandLoader />}>
      <OrdersContent searchParams={searchParams} />
    </Suspense>
  );
}
