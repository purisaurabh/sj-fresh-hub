import { Building2, Pencil } from "lucide-react";
import { AdminBuildingsFilters } from "@/components/admin/AdminBuildingsFilters";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { BuildingDialog } from "@/components/admin/BuildingDialog";
import { BuildingStatusButton } from "@/components/admin/BuildingStatusButton";
import { DeleteBuildingButton } from "@/components/admin/DeleteBuildingButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersPagedList } from "@/components/orders/OrdersPagedList";
import {
  buildingsFilterHref,
  filterAdminBuildings,
  parseAdminBuildingsFilter,
} from "@/features/admin/buildings-filter";
import { getAdminBuildings } from "@/features/admin/queries";
import { ADMIN_CATALOG_PAGE_SIZE } from "@/lib/constants";
import { paginateItems } from "@/lib/paginate";

const actionClass =
  "h-10 w-full cursor-pointer justify-center border-forest/30 px-2 text-sm font-medium text-forest";

export const metadata = { title: "Buildings" };

type BuildingsPageProps = {
  searchParams: Promise<{
    status?: string;
    text?: string;
    customers?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
};

async function BuildingsContent({ searchParams }: BuildingsPageProps) {
  const params = await searchParams;
  const filter = parseAdminBuildingsFilter(params);
  const buildings = await getAdminBuildings();
  const activeCount = buildings.filter((building) => building.is_active).length;
  const visible = filterAdminBuildings(buildings, filter);
  const paged = paginateItems(visible, filter.page ?? 1, ADMIN_CATALOG_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <AdminPageHeader
        title="Buildings"
        description={`Only active buildings (${activeCount} of ${buildings.length}) appear at registration and checkout.`}
        action={<BuildingDialog />}
      />
      <AdminBuildingsFilters filter={filter}>
        {buildings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-mint text-forest">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 font-semibold text-gray-900">No buildings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add the societies you deliver to, then mark them active.</p>
            <div className="mt-4 flex justify-center">
              <BuildingDialog />
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-12 text-center">
            <p className="font-semibold text-gray-900">No buildings match these filters</p>
            <p className="mt-1 text-sm text-muted-foreground">Clear filters or try a different search.</p>
          </div>
        ) : (
          <OrdersPagedList
            page={paged.page}
            total={paged.total}
            pageSize={paged.pageSize}
            prevHref={paged.page > 1 ? buildingsFilterHref({ ...filter, page: paged.page - 1 }) : null}
            nextHref={paged.page * paged.pageSize < paged.total ? buildingsFilterHref({ ...filter, page: paged.page + 1 }) : null}
            label="Building pages"
            skeleton={<AdminProductsSkeleton count={ADMIN_CATALOG_PAGE_SIZE} />}
          >
            <ul className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              {paged.items.map((building) => (
                <li
                  key={building.id}
                  className="flex flex-col gap-3 border-b border-border px-4 py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        building.is_active ? "bg-mint text-forest" : "bg-red-50 text-destructive"
                      }`}
                      aria-hidden="true"
                    >
                      <Building2 className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-gray-900">{building.name}</h2>
                        <Badge className={building.is_active ? "bg-mint text-forest" : "bg-red-50 text-destructive"}>
                          {building.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {building.address?.trim() || "No sub text"}
                        {" · "}
                        {building.linked_count === 1 ? "1 customer" : `${building.linked_count} customers`}
                      </p>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:w-72 sm:shrink-0 sm:grid-cols-3">
                    <div className="min-w-0">
                      <BuildingDialog
                        building={{ id: building.id, name: building.name, address: building.address }}
                        trigger={
                          <Button type="button" variant="outline" className={actionClass}>
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit
                          </Button>
                        }
                      />
                    </div>
                    <BuildingStatusButton buildingId={building.id} isActive={building.is_active} className={actionClass} />
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <DeleteBuildingButton
                        buildingId={building.id}
                        buildingName={building.name}
                        linkedCount={building.linked_count}
                        className="h-10"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </OrdersPagedList>
        )}
      </AdminBuildingsFilters>
    </div>
  );
}

export default function AdminBuildingsPage({ searchParams }: BuildingsPageProps) {
  return <BuildingsContent searchParams={searchParams} />;
}
