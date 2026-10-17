"use client";

import { useEffect, useOptimistic, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ListFilter, Search, X } from "lucide-react";
import { AdminProductsSkeleton } from "@/components/admin/AdminProductsFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { hasAdminUsersFilters, usersFilterHref, type AdminUsersFilter } from "@/features/admin/users-filter";
import { ADMIN_CATALOG_PAGE_SIZE } from "@/lib/constants";

const SELECT_CLASS =
  "h-11 w-full appearance-none rounded-xl border border-border bg-white py-1 pr-10 pl-3 text-sm font-medium text-gray-900 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type BuildingOption = { id: string; name: string };

type AdminUsersFiltersProps = {
  filter: AdminUsersFilter;
  buildings: BuildingOption[];
  children: ReactNode;
};

function emptyDraft(filter: AdminUsersFilter): AdminUsersFilter {
  return {
    role: filter.role,
    building: filter.building,
    orders: filter.orders,
    q: filter.q,
    sort: filter.sort,
  };
}

export function AdminUsersFilters({ filter, buildings, children }: AdminUsersFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useOptimistic(filter);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdminUsersFilter>(() => emptyDraft(filter));
  const applied = hasAdminUsersFilters(active);

  function go(next: AdminUsersFilter) {
    const href = usersFilterHref({ ...next, page: undefined });
    startTransition(() => {
      setActive({ ...next, page: undefined });
      router.replace(href, { scroll: false });
    });
  }

  function openSheet() {
    setDraft(emptyDraft(active));
    setOpen(true);
  }

  function cancelSheet() {
    setDraft(emptyDraft(active));
    setOpen(false);
  }

  function applySheet() {
    go({
      ...draft,
      q: draft.q?.trim() || undefined,
    });
    setOpen(false);
  }

  return (
    <>
      <div className="flex gap-2 md:hidden">
        <Button
          type="button"
          variant={applied ? undefined : "outline"}
          className={`h-11 min-w-0 flex-1 ${applied ? "bg-forest text-white hover:bg-forest/90" : "border-border bg-white text-forest hover:bg-mint"}`}
          onClick={openSheet}
        >
          <ListFilter className="size-4" aria-hidden="true" />
          Filter
          {applied ? <span className="rounded-full bg-white/20 px-1.5 text-xs">On</span> : null}
        </Button>
        {applied ? (
          <Button type="button" variant="outline" className="h-11 shrink-0 border-border bg-white text-forest hover:bg-mint" onClick={() => go({})}>
            <X className="size-4" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (next) {
              openSheet();
              return;
            }
            cancelSheet();
          }}
        >
          <SheetContent side="left" showCloseButton={false} className="w-full max-w-none gap-0 bg-white p-0 sm:max-w-none">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Filter users</SheetTitle>
              <SheetDescription>Set the options, then tap Apply.</SheetDescription>
              {hasAdminUsersFilters(draft) ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-fit px-0 text-forest hover:bg-transparent hover:underline"
                  onClick={() => setDraft({})}
                >
                  <X className="size-4" aria-hidden="true" />
                  Clear all
                </Button>
              ) : null}
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
              <FilterFields idPrefix="mobile" value={draft} buildings={buildings} stacked onChange={setDraft} />
            </div>
            <SheetFooter className="grid grid-cols-2 gap-2 border-t border-border">
              <Button type="button" variant="outline" className="h-11" onClick={cancelSheet}>
                Cancel
              </Button>
              <Button type="button" className="h-11 bg-forest text-white hover:bg-forest/90" onClick={applySheet}>
                Apply
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden min-w-0 gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" data-local-navigation>
        <FilterFields idPrefix="desktop" value={active} buildings={buildings} commitSearch onChange={go} />
      </div>

      {applied ? (
        <div className="hidden justify-end md:flex">
          <Button type="button" variant="outline" className="h-9 border-border bg-white text-forest hover:bg-mint" onClick={() => go({})}>
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        </div>
      ) : null}

      {isPending ? <AdminProductsSkeleton count={ADMIN_CATALOG_PAGE_SIZE} /> : children}
    </>
  );
}

function FilterFields({
  idPrefix,
  value,
  buildings,
  stacked = false,
  commitSearch = false,
  onChange,
}: {
  idPrefix: string;
  value: AdminUsersFilter;
  buildings: BuildingOption[];
  stacked?: boolean;
  commitSearch?: boolean;
  onChange: (next: AdminUsersFilter) => void;
}) {
  const fieldClass = stacked ? "" : "min-w-0";
  const [search, setSearch] = useState(value.q ?? "");

  useEffect(() => {
    setSearch(value.q ?? "");
  }, [value.q]);

  function commitUserSearch() {
    const q = search.trim() || undefined;
    if (q === (value.q || undefined)) {
      return;
    }
    onChange({ ...value, q });
  }

  return (
    <>
      <FilterField className={fieldClass} label="Role" htmlFor={`${idPrefix}-user-role-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-user-role-filter`}
            className={SELECT_CLASS}
            value={value.role ?? ""}
            onChange={(event) => onChange({ ...value, role: (event.target.value || undefined) as AdminUsersFilter["role"] })}
          >
            <option value="">All roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Building" htmlFor={`${idPrefix}-user-building-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-user-building-filter`}
            className={SELECT_CLASS}
            value={value.building ?? ""}
            onChange={(event) =>
              onChange({ ...value, building: event.target.value || undefined })
            }
          >
            <option value="">All buildings</option>
            <option value="none">No building</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Orders" htmlFor={`${idPrefix}-user-orders-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-user-orders-filter`}
            className={SELECT_CLASS}
            value={value.orders ?? ""}
            onChange={(event) =>
              onChange({ ...value, orders: (event.target.value || undefined) as AdminUsersFilter["orders"] })
            }
          >
            <option value="">Any orders</option>
            <option value="with">Has orders</option>
            <option value="empty">No orders</option>
            <option value="open">Has open orders</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Sort" htmlFor={`${idPrefix}-user-sort-filter`}>
        <div className="relative">
          <select
            id={`${idPrefix}-user-sort-filter`}
            className={SELECT_CLASS}
            value={value.sort ?? "newest"}
            onChange={(event) =>
              onChange({
                ...value,
                sort: event.target.value === "newest" ? undefined : (event.target.value as AdminUsersFilter["sort"]),
              })
            }
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="orders_desc">Most orders</option>
            <option value="spent_desc">Highest order value</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      </FilterField>
      <FilterField className={fieldClass} label="Search" htmlFor={`${idPrefix}-user-search-filter`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${idPrefix}-user-search-filter`}
            value={commitSearch ? search : (value.q ?? "")}
            onChange={(event) => {
              if (commitSearch) {
                setSearch(event.target.value);
                return;
              }
              onChange({ ...value, q: event.target.value || undefined });
            }}
            onBlur={commitSearch ? commitUserSearch : undefined}
            onKeyDown={
              commitSearch
                ? (event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitUserSearch();
                    }
                  }
                : undefined
            }
            placeholder="Name, phone, or building"
            className="h-11 rounded-xl bg-white pr-3 pl-9 text-sm"
          />
        </div>
      </FilterField>
    </>
  );
}

function FilterField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
