import Link from "next/link";
import { Eye, Phone, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { AdminUsersFilters } from "@/components/admin/AdminUsersFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import { getAdminBuildings, getAdminUsers } from "@/features/admin/queries";
import { filterAdminUsers, parseAdminUsersFilter, userRoleLabel, usersFilterHref } from "@/features/admin/users-filter";
import { ADMIN_CATALOG_PAGE_SIZE } from "@/lib/constants";
import { formatDateTime, formatPhone } from "@/lib/datetime";
import { formatInr } from "@/lib/money";
import { paginateItems } from "@/lib/paginate";

const actionClass = "h-10 w-full justify-center border-forest/30 px-2 text-sm font-medium text-forest";

export const metadata = { title: "Users" };

type UsersPageProps = {
  searchParams: Promise<{
    role?: string;
    building?: string;
    orders?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

async function UsersContent({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const filter = parseAdminUsersFilter(params);
  const [users, buildings] = await Promise.all([getAdminUsers(), getAdminBuildings()]);
  const customerCount = users.filter((user) => user.role === "customer").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const visible = filterAdminUsers(users, filter);
  const paged = paginateItems(visible, filter.page ?? 1, ADMIN_CATALOG_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Users"
        description={`${customerCount} customers and ${adminCount} ${adminCount === 1 ? "admin" : "admins"}. Open a person to see addresses and orders.`}
      />
      <AdminUsersFilters filter={filter} buildings={buildings.map((building) => ({ id: building.id, name: building.name }))}>
        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-mint text-forest">
              <Users className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-semibold text-gray-900">No users yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Customers appear here after they register.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p className="font-semibold text-gray-900">No users match these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Clear filters or try a different search.</p>
          </div>
        ) : (
          <OrdersPagedList
            page={paged.page}
            total={paged.total}
            pageSize={paged.pageSize}
            prevHref={paged.page > 1 ? usersFilterHref({ ...filter, page: paged.page - 1 }) : null}
            nextHref={paged.page * paged.pageSize < paged.total ? usersFilterHref({ ...filter, page: paged.page + 1 }) : null}
            label="User pages"
            skeleton={<AdminProductsSkeleton count={ADMIN_CATALOG_PAGE_SIZE} />}
          >
            <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              {paged.items.map((user) => (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mint text-sm font-semibold text-forest" aria-hidden="true">
                      {user.full_name.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-gray-900">{user.full_name}</h2>
                        <Badge className={user.role === "admin" ? "bg-sunshine text-gray-900" : "bg-mint text-forest"}>
                          {userRoleLabel(user.role)}
                        </Badge>
                        {user.open_order_count > 0 ? (
                          <Badge className="bg-amber-100 text-amber-900">
                            {user.open_order_count === 1 ? "1 open order" : `${user.open_order_count} open orders`}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatPhone(user.phone)}
                        {" · "}
                        {user.building_name ?? "No building"}
                        {" · "}
                        {user.order_count === 1 ? "1 order" : `${user.order_count} orders`}
                        {user.order_value > 0 ? ` · ${formatInr(user.order_value)}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Joined {formatDateTime(user.created_at)}</p>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:w-52 sm:shrink-0">
                    <Button asChild variant="outline" className={actionClass}>
                      <Link href={`/admin/users/${user.id}`}>
                        <Eye className="size-3.5" aria-hidden="true" />
                        View
                      </Link>
                    </Button>
                    {user.phone ? (
                      <Button asChild variant="outline" className={actionClass}>
                        <a href={`tel:+91${user.phone}`}>
                          <Phone className="size-3.5" aria-hidden="true" />
                          Call
                        </a>
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" className={actionClass} disabled>
                        <Phone className="size-3.5" aria-hidden="true" />
                        Call
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </OrdersPagedList>
        )}
      </AdminUsersFilters>
    </div>
  );
}

export default function AdminUsersPage({ searchParams }: UsersPageProps) {
  return <UsersContent searchParams={searchParams} />;
}
