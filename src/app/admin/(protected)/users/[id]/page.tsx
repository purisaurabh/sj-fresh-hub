import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import { AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { getAdminUser } from "@/features/admin/queries";
import { userRoleLabel } from "@/features/admin/users-filter";
import { ADMIN_ORDERS_PAGE_SIZE } from "@/lib/constants";
import { formatDateTime, formatPhone } from "@/lib/datetime";
import { formatInr } from "@/lib/money";
import { paginateItems, parsePage } from "@/lib/paginate";

export const metadata = { title: "User" };

type UserDetailProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

function paymentLabel(status: string) {
  return status === "collected" ? "COD collected" : "COD pending";
}

async function UserDetail({ params, searchParams }: UserDetailProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await getAdminUser(id);
  if (!user) {
    notFound();
  }

  const page = parsePage(query.page);
  const pagedOrders = paginateItems(user.orders, page, ADMIN_ORDERS_PAGE_SIZE);
  const ordersHref = (nextPage: number) => (nextPage > 1 ? `/admin/users/${user.id}?page=${nextPage}` : `/admin/users/${user.id}`);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <Link href="/admin/users" className="inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-medium text-forest hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          All users
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-lg font-semibold md:text-2xl">{user.full_name}</h1>
          <Badge className={user.role === "admin" ? "bg-sunshine text-gray-900" : "bg-mint text-forest"}>
            {userRoleLabel(user.role)}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Joined {formatDateTime(user.created_at)}</p>
      </div>

      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Contact</h2>
        <p className="mt-2 text-sm">{user.building_name ?? "No building selected"}</p>
        {user.phone ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <a href={`tel:+91${user.phone}`} className="text-sm font-medium text-forest">
              {formatPhone(user.phone)}
            </a>
            <Button asChild className="h-9 w-fit shrink-0 bg-forest px-2.5 text-white hover:bg-forest/90">
              <a href={`tel:+91${user.phone}`}>
                <Phone className="size-3.5" aria-hidden="true" />
                Call {user.full_name}
              </a>
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No phone on file</p>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-[11px] text-muted-foreground">Orders</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{user.order_count}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-[11px] text-muted-foreground">Open</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{user.open_order_count}</p>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-[11px] text-muted-foreground">Order value</p>
          <p className="mt-1 text-xl font-semibold text-gray-900">{formatInr(user.order_value)}</p>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Addresses</h2>
        {user.addresses.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No saved addresses.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {user.addresses.map((address) => (
              <li key={address.id} className="rounded-xl border border-border px-3 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{address.label?.trim() || "Address"}</p>
                  {address.is_default ? <Badge className="bg-mint text-forest">Default</Badge> : null}
                </div>
                <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {address.line1}
                    {address.building_name ? ` · ${address.building_name}` : ""}
                    {address.landmark ? ` · ${address.landmark}` : ""}
                    {address.pincode ? ` · ${address.pincode}` : ""}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
        <h2 className="font-semibold">Orders</h2>
        {user.orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="mt-3">
            <OrdersPagedList
              page={pagedOrders.page}
              total={pagedOrders.total}
              pageSize={pagedOrders.pageSize}
              prevHref={pagedOrders.page > 1 ? ordersHref(pagedOrders.page - 1) : null}
              nextHref={
                pagedOrders.page * pagedOrders.pageSize < pagedOrders.total ? ordersHref(pagedOrders.page + 1) : null
              }
              label="Order pages"
              skeleton={<AdminProductsSkeleton count={ADMIN_ORDERS_PAGE_SIZE} />}
            >
              <ul className="space-y-2">
                {pagedOrders.items.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-start justify-between gap-3 rounded-xl border border-border px-3 py-3 hover:border-forest/40"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-gray-900">{order.order_no}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {formatDateTime(order.created_at)} · {order.building_name_snapshot} · {paymentLabel(order.payment_status)}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1">
                        <OrderStatusBadge status={order.status} />
                        <span className="text-sm font-semibold text-gray-900">{formatInr(order.total)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </OrdersPagedList>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminUserPage({ params, searchParams }: UserDetailProps) {
  return <UserDetail params={params} searchParams={searchParams} />;
}
